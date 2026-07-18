"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/client";

import {
  Send,
  ImagePlus,
  Mic,
  Square,
  X,
  Download,
  Loader2,
  Smile,
} from "lucide-react";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;

  message: string;

  image_url: string | null;
  audio_url: string | null;
  reaction: string | null;

  created_at: string;

  seen: boolean;
};

export default function ChatPage() {

  // Messages
  const [messages, setMessages] = useState<Message[]>([]);

  // Text Input
  const [text, setText] = useState("");

  // Current User
  const [myId, setMyId] = useState("");

  // Partner
  const [partnerId, setPartnerId] = useState("");
  const [partnerName, setPartnerName] = useState("");

  // Status
  const [online, setOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState("");

  // Typing
  const [typing, setTyping] = useState(false);

  // Image Preview
  const [previewImage, setPreviewImage] = useState("");

  // Upload Loader
  const [uploading, setUploading] = useState(false);

  // Voice Recording
  const [recording, setRecording] = useState(false);

  // Refs
  const bottomRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [reactionFor, setReactionFor] = useState<string | null>(null);

  const audioChunks =
    useRef<Blob[]>([]);
      // ==========================
  // Auto Scroll
  // ==========================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  useEffect(() => {

const close = () => setReactionFor(null);

window.addEventListener("click", close);

return () => window.removeEventListener("click", close);

}, []);

  // ==========================
  // Initial Load
  // ==========================
  useEffect(() => {
    loadChat();
  }, []);

  // ==========================
  // Realtime Messages
  // ==========================
  useEffect(() => {
    if (!myId || !partnerId) return;

    const messageChannel = supabase
      .channel(`messages-${myId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          loadMessages(myId, partnerId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [myId, partnerId]);

  // ==========================
  // Partner Status Realtime
  // ==========================
  useEffect(() => {
    if (!partnerId) return;

    const profileChannel = supabase
      .channel(`profile-${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${partnerId}`,
        },
        async () => {
          const { data } = await supabase
            .from("profiles")
            .select("username,is_online,last_seen")
            .eq("id", partnerId)
            .single();

          if (data) {
            setPartnerName(data.username || "Partner");
            setOnline(data.is_online);
            setLastSeen(data.last_seen || "");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [partnerId]);

  // ==========================
  // Typing Indicator
  // ==========================
  useEffect(() => {
    if (!partnerId) return;

    const typingChannel = supabase.channel(`typing-${partnerId}`);

    typingChannel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.user !== myId) {
          setTyping(payload.typing);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [partnerId, myId]);

  // ==========================
  // Online / Offline Presence
  // ==========================
  useEffect(() => {
    if (!myId) return;

    const goOffline = async () => {
      await supabase
        .from("profiles")
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq("id", myId);
    };

    const goOnline = async () => {
      await supabase
        .from("profiles")
        .update({
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq("id", myId);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        goOffline();
      } else {
        goOnline();
      }
    };

    window.addEventListener("beforeunload", goOffline);
    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      goOffline();

      window.removeEventListener(
        "beforeunload",
        goOffline
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [myId]);
  // ==========================
// Load Chat
// ==========================
async function loadChat() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  setMyId(user.id);

  // Mark myself online
  await supabase
    .from("profiles")
    .update({
      is_online: true,
      last_seen: new Date().toISOString(),
    })
    .eq("id", user.id);

  // Get my profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("partner_id")
    .eq("id", user.id)
    .single();

  if (error || !profile?.partner_id) {
    alert("No partner connected.");
    return;
  }

  setPartnerId(profile.partner_id);

  // Get partner details
  const { data: partner } = await supabase
    .from("profiles")
    .select("username,is_online,last_seen")
    .eq("id", profile.partner_id)
    .single();

  if (partner) {
    setPartnerName(partner.username || "Partner");
    setOnline(partner.is_online);
    setLastSeen(partner.last_seen || "");
  }

  // Load previous messages
  await loadMessages(user.id, profile.partner_id);
}
// ==========================
// Load Messages
// ==========================
async function loadMessages(my: string, partner: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${my},receiver_id.eq.${partner}),and(sender_id.eq.${partner},receiver_id.eq.${my})`
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(error);
    return;
  }

  // Mark partner messages as seen
  await supabase
    .from("messages")
    .update({
      seen: true,
    })
    .eq("receiver_id", my)
    .eq("sender_id", partner)
    .eq("seen", false);

  setMessages(data ?? []);

  setTimeout(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, 100);
}

// ==========================
// Send Text Message
// ==========================
async function sendMessage() {
  if (!text.trim()) return;

  const { error } = await supabase
    .from("messages")
    .insert({
      sender_id: myId,
      receiver_id: partnerId,
      message: text.trim(),
      image_url: null,
      audio_url: null,
      seen: false,
    });

  if (error) {
    alert(error.message);
    return;
  }

  // Stop typing
  await supabase
    .channel(`typing-${partnerId}`)
    .send({
      type: "broadcast",
      event: "typing",
      payload: {
        user: myId,
        typing: false,
      },
    });

  setText("");

  await loadMessages(myId, partnerId);
}

// ==========================
// Upload Image
// ==========================
async function uploadImage(file: File) {
  if (!partnerId || !myId) return;

  setUploading(true);

  const ext = file.name.split(".").pop();

  const fileName =
    `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${ext}`;

  const { error: uploadError } =
    await supabase.storage
      .from("chat-images")
      .upload(fileName, file);

  if (uploadError) {
    setUploading(false);
    alert(uploadError.message);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("chat-images")
    .getPublicUrl(fileName);

  const { error } = await supabase
    .from("messages")
    .insert({
      sender_id: myId,
      receiver_id: partnerId,
      message: "",
      image_url: publicUrl,
      audio_url: null,
      seen: false,
    });

  setUploading(false);

  if (error) {
    alert(error.message);
    return;
  }

  await loadMessages(myId, partnerId);

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
}
// ==========================
// Upload Audio
// ==========================
async function uploadAudio(audioBlob: Blob) {
  if (!myId || !partnerId) return;

  setUploading(true);

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.webm`;

  const { error: uploadError } = await supabase.storage
    .from("chat-audio")
    .upload(fileName, audioBlob);

  if (uploadError) {
    setUploading(false);
    alert(uploadError.message);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("chat-audio")
    .getPublicUrl(fileName);

  const { error } = await supabase
    .from("messages")
    .insert({
      sender_id: myId,
      receiver_id: partnerId,
      message: "",
      image_url: null,
      audio_url: publicUrl,
      seen: false,
    });

  setUploading(false);

  if (error) {
    alert(error.message);
    return;
  }

  await loadMessages(myId, partnerId);
}

// ==========================
// Start Recording
// ==========================
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const recorder = new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;
    audioChunks.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, {
        type: "audio/webm",
      });

      stream.getTracks().forEach((track) => track.stop());

      setRecording(false);

      await uploadAudio(audioBlob);
    };

    recorder.start();
    setRecording(true);

  } catch (err) {
    console.error(err);
    alert("Microphone permission denied.");
  }
}

// ==========================
// Stop Recording
// ==========================
function stopRecording() {
  mediaRecorderRef.current?.stop();
}

// ==========================
// Typing
// ==========================
function handleTyping(value: string) {
  setText(value);

  supabase
    .channel(`typing-${partnerId}`)
    .send({
      type: "broadcast",
      event: "typing",
      payload: {
        user: myId,
        typing: value.length > 0,
      },
    });
}
async function reactToMessage(
  messageId: string,
  emoji: string
) {
  const { error } = await supabase
    .from("messages")
    .update({
      reaction: emoji,
    })
    .eq("id", messageId);

  if (!error) {
    await loadMessages(myId, partnerId);
  }
}
function addEmoji(emojiData: any) {
  setText((prev) => prev + emojiData.emoji);
  setShowEmoji(false);
}
return (
  <main className="min-h-screen bg-zinc-950 text-white flex flex-col">

    {/* Header */}
    <header className="border-b border-zinc-800 p-5">

      <h1 className="text-3xl font-bold text-pink-500">
        ❤️ {partnerName || "Private Chat"}
      </h1>

      <p className="text-sm text-zinc-400">
        {typing ? (
          <span className="text-green-400">✍️ Typing...</span>
        ) : online ? (
          <span className="text-green-400">🟢 Online</span>
        ) : lastSeen ? (
          <>Last seen {new Date(lastSeen).toLocaleString()}</>
        ) : (
          "Offline"
        )}
      </p>
      <div className="relative">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="text-zinc-400 hover:text-white transition"
        >
          <Smile className="w-5 h-5" />
        </button>

        {showEmoji && (
          <div className="absolute bottom-full right-0 mb-2 bg-zinc-800 border border-zinc-600 rounded-lg p-2">
            {["😊", "😂", "😍", "🥰", "😘", "😗", "😙", "😚"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji({ emoji })}
                className="text-xl hover:bg-zinc-600 rounded p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
    

    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-6">

      {messages.length === 0 ? (

        <div className="text-center text-zinc-500 mt-20">
          No messages yet ❤️
        </div>

      ) : (

        messages.map((msg) => (

          <div
            key={msg.id}
            className={`mb-4 flex ${
              msg.sender_id === myId
                ? "justify-end"
                : "justify-start"
            }`}
          >

  <div
  onContextMenu={(e) => {
    e.preventDefault();
    setReactionFor(msg.id);
  }}
  className={`relative max-w-[75%] rounded-2xl px-4 py-3 ${
    msg.sender_id === myId
      ? "bg-pink-600"
      : "bg-zinc-800"
  }`}
>
              {msg.image_url && (
                <img
                  src={msg.image_url}
                  alt="Chat"
                  className="rounded-xl mb-2 max-w-full cursor-pointer hover:opacity-90 transition"
                  onClick={() => setPreviewImage(msg.image_url!)}
                />
              )}

              {msg.audio_url && (
                <audio
                  controls
                  className="w-full mb-2"
                >
                  <source
                    src={msg.audio_url}
                    type="audio/webm"
                  />
                </audio>
              )}

              {msg.message && (
                <p className="break-words">
                  {msg.message}
                </p>
              )}

              <div className="flex justify-end items-center gap-2 mt-2 text-xs opacity-70">

                <span>
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                {msg.sender_id === myId && (
                  <span className="font-bold">
                    {msg.seen ? "✓✓" : "✓"}
                  </span>
                )}
                {msg.reaction && (
  <div className="mt-2 text-lg">
    {msg.reaction}
  </div>
)}

              </div>

            </div>

          </div>

        ))

      )}

      <div ref={bottomRef}></div>

    </div>
    {reactionFor === msg.id && (

<div className="absolute -top-12 left-0 bg-zinc-900 rounded-full shadow-xl px-2 py-1 flex gap-1 border border-zinc-700 z-50">

{reactions.map((emoji) => (

<button
key={emoji}
onClick={()=>{
reactToMessage(msg.id,emoji);
setReactionFor(null);
}}
className="hover:scale-125 transition text-xl"
>
{emoji}
</button>

))}

</div>

)}

    {/* Input */}
    <div className="relative border-t border-zinc-800 p-4 flex gap-3"></div>
    {showEmoji && (
  <div className="absolute bottom-24 left-4 z-50">
    <EmojiPicker
      onEmojiClick={addEmoji}
      theme="dark"
      height={350}
      width={300}
    />
  </div>
)}
    <div className="border-t border-zinc-800 p-4 flex gap-3">
      

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          if (e.target.files?.[0]) {
            uploadImage(e.target.files[0]);
          }
        }}
      />

      {/* Image Button */}
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="rounded-xl bg-zinc-800 px-4 hover:bg-zinc-700 transition disabled:opacity-50"
      >
        <ImagePlus size={22} />
      </button>
      <button
  type="button"
  onClick={() => setShowEmoji(!showEmoji)}
  className="rounded-xl bg-zinc-800 px-4 hover:bg-zinc-700 transition"
>
  <Smile size={22} />
</button>

      {/* Mic */}
      {recording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="rounded-xl bg-red-600 px-4 hover:bg-red-700 transition"
        >
          <Square size={22} />
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="rounded-xl bg-green-600 px-4 hover:bg-green-700 transition"
        >
          <Mic size={22} />
        </button>
      )}

      {/* Text */}
      <input
        value={text}
        onChange={(e) => handleTyping(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
        placeholder="Type a message..."
        className="flex-1 rounded-xl bg-zinc-900 p-4 outline-none"
      />

      {/* Send */}
      <button
        type="button"
        disabled={uploading}
        onClick={sendMessage}
        className="rounded-xl bg-pink-600 px-6 hover:bg-pink-700 transition disabled:opacity-50"
      >
        {uploading ? (
          <Loader2
            size={22}
            className="animate-spin"
          />
        ) : (
          <Send size={22} />
        )}
      </button>

    </div>

    {/* Image Preview */}
    {previewImage && (

      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">

        <button
          onClick={() => setPreviewImage("")}
          className="absolute top-5 right-5"
        >
          <X size={35} />
        </button>

        <img
          src={previewImage}
          className="max-h-[90vh] max-w-[90vw] rounded-xl"
        />

        <a
          href={previewImage}
          download
          className="absolute bottom-5 bg-pink-600 px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <Download size={20} />
          Download
        </a>

      </div>

    )}

  </main>
);

}