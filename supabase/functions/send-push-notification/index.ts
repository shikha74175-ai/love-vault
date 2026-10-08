import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-push-webhook-secret",
};

type MessageRecord = {
  id?: string;
  sender_id?: string;
  receiver_id?: string;
  message?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  audio_url?: string | null;
  file_type?: string | null;
};

type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: MessageRecord;
};

function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

async function createGoogleAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
}) {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const claimSet = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));

  const unsignedToken = `${encodedHeader}.${encodedClaimSet}`;

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(serviceAccount.private_key),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(unsignedToken),
  );

  const signatureBytes = new Uint8Array(signature);

  let binary = "";

  for (const byte of signatureBytes) {
    binary += String.fromCharCode(byte);
  }

  const encodedSignature = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const assertion = `${unsignedToken}.${encodedSignature}`;

  const response = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type:
          "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Google OAuth error:", data);
    throw new Error("Unable to create Google access token.");
  }

  return data.access_token as string;
}

async function getPushTokens(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
) {
  const url =
    `${supabaseUrl}/rest/v1/push_tokens` +
    `?select=id,token` +
    `&user_id=eq.${encodeURIComponent(userId)}`;

  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Supabase token lookup error:", data);
    throw new Error("Unable to load push tokens.");
  }

  return data as Array<{
    id: string;
    token: string;
  }>;
}

async function getSenderName(
  supabaseUrl: string,
  serviceRoleKey: string,
  senderId: string,
) {
  const url =
    `${supabaseUrl}/rest/v1/profiles` +
    `?select=full_name,username` +
    `&id=eq.${encodeURIComponent(senderId)}` +
    `&limit=1`;

  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    return "Your partner";
  }

  const data = await response.json();

  if (!Array.isArray(data) || !data[0]) {
    return "Your partner";
  }

  return (
    data[0].full_name ||
    data[0].username ||
    "Your partner"
  );
}

function getNotificationBody(record: MessageRecord) {
  if (record.message?.trim()) {
    return record.message.trim().slice(0, 180);
  }

  if (record.image_url) {
    return "📷 Sent you a photo";
  }

  if (record.video_url) {
    return "🎥 Sent you a video";
  }

  if (record.audio_url) {
    return "🎤 Sent you a voice message";
  }

  if (record.file_type === "document") {
    return "📎 Sent you a file";
  }

  return "You have a new message ❤️";
}

async function deleteInvalidToken(
  supabaseUrl: string,
  serviceRoleKey: string,
  tokenId: string,
) {
  await fetch(
    `${supabaseUrl}/rest/v1/push_tokens?id=eq.${encodeURIComponent(tokenId)}`,
    {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );
}

/**
 * Sends a DATA-ONLY FCM message.
 *
 * Important:
 * We intentionally do NOT send the `notification` payload here.
 * The Firebase Service Worker is responsible for displaying
 * the notification using showNotification().
 *
 * This prevents duplicate notifications.
 */
async function sendFirebaseNotification(
  accessToken: string,
  projectId: string,
  token: string,
  title: string,
  body: string,
) {
  return fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,

          data: {
            title,
            body,
            url: "/chat",
          },
        },
      }),
    },
  );
}

serve(async (req) => {
  /*
   * Webhook security
   *
   * The Database Webhook must send:
   *
   * x-push-webhook-secret: <same secret stored in Supabase>
   */

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const webhookSecret =
    Deno.env.get("PUSH_WEBHOOK_SECRET");

  const incomingSecret =
    req.headers.get("x-push-webhook-secret");

  if (
    !webhookSecret ||
    !incomingSecret ||
    incomingSecret !== webhookSecret
  ) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unauthorized",
      }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get("supabase_service_role_key");

    const firebaseServiceAccountRaw =
      Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL is missing.");
    }

    if (!serviceRoleKey) {
      throw new Error(
        "supabase_service_role_key secret is missing.",
      );
    }

    if (!firebaseServiceAccountRaw) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT secret is missing.",
      );
    }

    const serviceAccount =
      JSON.parse(firebaseServiceAccountRaw);

    const payload =
      (await req.json()) as WebhookPayload;

    const record = payload.record;

    if (!record) {
      throw new Error(
        "Webhook record is missing.",
      );
    }

    if (!record.receiver_id) {
      throw new Error(
        "receiver_id is missing.",
      );
    }

    // Never notify the sender.
    if (
      record.sender_id &&
      record.sender_id === record.receiver_id
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          reason: "sender_is_receiver",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const tokens = await getPushTokens(
      supabaseUrl,
      serviceRoleKey,
      record.receiver_id,
    );

    if (!tokens.length) {
      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
          reason: "no_push_tokens",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const senderName = record.sender_id
      ? await getSenderName(
          supabaseUrl,
          serviceRoleKey,
          record.sender_id,
        )
      : "Your partner";

    const body =
      getNotificationBody(record);

    const accessToken =
      await createGoogleAccessToken(
        serviceAccount,
      );

    let sent = 0;
    let removed = 0;

    for (const pushToken of tokens) {
      try {
        const response =
          await sendFirebaseNotification(
            accessToken,
            serviceAccount.project_id,
            pushToken.token,
            senderName,
            body,
          );

        if (response.ok) {
          sent++;
          continue;
        }

        const errorData =
          await response.json();

        console.error(
          "FCM send error:",
          errorData,
        );

        const errorText =
          JSON.stringify(errorData);

        if (
          errorText.includes("UNREGISTERED") ||
          errorText.includes(
            "registration-token-not-registered",
          )
        ) {
          await deleteInvalidToken(
            supabaseUrl,
            serviceRoleKey,
            pushToken.id,
          );

          removed++;
        }
      } catch (error) {
        console.error(
          "Token send failed:",
          error,
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        removed,
        totalTokens: tokens.length,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      "Push function error:",
      error,
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});