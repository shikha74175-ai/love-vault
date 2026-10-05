"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/client";
import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { savePushToken } from "@/lib/supabase/pushTokens";
import {
  Send,
  ImagePlus,
  Mic,
  Square,
  X,
  Download,
  Loader2,
  Smile,
  Search,
  Reply,
  Pencil,
  Copy,
  Trash2,
  MoreVertical,
  Check,
  Clock3,
  Maximize2,
  UserRound,
  XCircle,
  Images,
  Video,
  Music2,
  ShieldCheck,
  Paperclip,
  Camera,
  Bell,
  BellOff,
  BellRing,
  EyeOff,
  Settings2,
} from "lucide-react";

// Must be declared at module scope, not inside the component —
// calling dynamic() on every render recreates the lazy component
// and can cause the picker to unmount/remount or flicker.
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;

  message: string;

  image_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  viewed_by: string[];

  reaction: string | null;

  reply_to_id: string | null;

  edited: boolean;
  view_once: boolean;

  deleted_for_everyone: boolean;

  deleted_for: string[];

  created_at: string;

  seen: boolean;
  status?: "sending" | "sent" | "delivered" | "seen";

  // Disappearing messages
  expires_at?: string | null;
  disappear_after?: number | null;
};

const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "🙏", "👍"];

export default function ChatPage() {
  // Messages
  const [messages, setMessages] = useState<Message[]>([]);

  // Text Input
  const [text, setText] = useState("");

  // Current User
  const [myId, setMyId] = useState("");
  const [viewOnce, setViewOnce] = useState(false);

  // Partner
  const [partnerId, setPartnerId] = useState("");
  const [partnerName, setPartnerName] = useState("");

  // Status
  const [online, setOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState("");

  // Typing
  const [typing, setTyping] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [chatInitialLoading, setChatInitialLoading] = useState(true);

  // Chat info / partner profile sheet
  const [profileOpen, setProfileOpen] = useState(false);
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false);
  const [mediaGalleryTab, setMediaGalleryTab] = useState<"all" | "photos" | "videos" | "audio">("all");

  // Image Preview
  const [previewImage, setPreviewImage] = useState("");
  const [previewImageMessage, setPreviewImageMessage] =
  useState<Message | null>(null);

  // Video Preview
  const [previewVideo, setPreviewVideo] = useState("");
  const [previewVideoMessage, setPreviewVideoMessage] =
    useState<Message | null>(null);

  // Upload Loader
  const [uploading, setUploading] = useState(false);

  // Voice Recording
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingStartedAtRef = useRef<number | null>(null);

  // Emoji picker (for composing a message)
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);

  // Per-message "..." menu (reply / edit / copy / delete / react)
  const [menuFor, setMenuFor] = useState<string | null>(null);

  // Reply
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  // Edit
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);

  // Refs
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const previousMessageCountRef = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [disappearAfter, setDisappearAfter] = useState<number | null>(null);

  // Chat privacy / notification settings
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);
  const [hideLastSeen, setHideLastSeen] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const [notificationSound, setNotificationSound] = useState(true);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const notifiedMessageIdsRef = useRef<Set<string>>(new Set());

  // ==========================
  // Auto Scroll
  // ==========================
  useEffect(() => {
    const previousCount = previousMessageCountRef.current;
    const incomingAdded = messages.length > previousCount && previousCount > 0;
    const list = messageListRef.current;
    const nearBottom = list
      ? list.scrollHeight - list.scrollTop - list.clientHeight < 180
      : true;

    if (!incomingAdded || nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasNewMessage(false);
      setNewMessageCount(0);
    } else {
      const added = Math.max(1, messages.length - previousCount);
      setNewMessageCount((count) => count + added);
      setHasNewMessage(true);
    }

    previousMessageCountRef.current = messages.length;
  }, [messages]);

  // Keep a small floating jump-to-latest control when the user scrolls away.
  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;

    const handleScroll = () => {
      const distance = list.scrollHeight - list.scrollTop - list.clientHeight;
      setShowScrollToBottom(distance > 320);
    };

    handleScroll();
    list.addEventListener("scroll", handleScroll, { passive: true });
    return () => list.removeEventListener("scroll", handleScroll);
  }, []);

  const jumpToLatestMessages = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setHasNewMessage(false);
    setNewMessageCount(0);
    setShowScrollToBottom(false);
  };

  // ==========================
  // Close any open per-message menu on outside click
  // ==========================
  useEffect(() => {
    const close = () => setMenuFor(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // ==========================
  // Initial Load
  // ==========================
  useEffect(() => {
    setChatInitialLoading(true);
    loadChat().finally(() => setChatInitialLoading(false));
  }, []);

  // Restore local chat notification preferences + browser permission.
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
    } else {
      setNotificationPermission(Notification.permission);
    }

    if (!myId) return;
    try {
      setMuted(localStorage.getItem(`couplenest-chat-muted-${myId}`) === "1");
      setNotificationSound(localStorage.getItem(`couplenest-chat-sound-${myId}`) !== "0");
    } catch {
      // Ignore storage restrictions.
    }
  }, [myId]);

  // ==========================
  // Realtime Messages + New Message Notifications
  // ==========================
  useEffect(() => {
    if (!myId || !partnerId) return;

    const messageChannel = supabase
      .channel(`messages-${myId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const incoming = payload.new as {
            id?: string;
            sender_id?: string;
            receiver_id?: string;
            message?: string | null;
            image_url?: string | null;
            video_url?: string | null;
            audio_url?: string | null;
          };

          const isPartnerMessage =
            incoming.sender_id === partnerId && incoming.receiver_id === myId;

          if (isPartnerMessage && incoming.id) {
            void showIncomingMessageNotification({
              id: incoming.id,
              message: incoming.message,
              image_url: incoming.image_url,
              video_url: incoming.video_url,
              audio_url: incoming.audio_url,
            });
          }

          void loadMessages(myId, partnerId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [myId, partnerId, muted, notificationPermission, partnerName]);

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
          if (payload.typing) {
            window.clearTimeout((window as any).__couplenestTypingTimer);
            (window as any).__couplenestTypingTimer = window.setTimeout(() => {
              setTyping(false);
            }, 4000);
          }
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
  const interval = setInterval(() => {
    setMessages((prev) =>
      prev.filter((m: Message) => {
        if (!m.expires_at) return true;
        return new Date(m.expires_at).getTime() > Date.now();
      })
    );
  }, 10000); // every 10 seconds

  return () => clearInterval(interval);
}, []);
  useEffect(() => {
    if (!myId) return;

    const goOffline = async () => {
      await supabase
        .from("profiles")
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq("id", myId);
    };

    const goOnline = async () => {
      await supabase
        .from("profiles")
        .update({ is_online: true, last_seen: new Date().toISOString() })
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
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      goOffline();
      window.removeEventListener("beforeunload", goOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [myId]);

  // ==========================
  // Chat Settings
  // ==========================
  function toggleMute() {
    const next = !muted;
    setMuted(next);
    try {
      if (next) localStorage.setItem(`couplenest-chat-muted-${myId}`, "1");
      else localStorage.removeItem(`couplenest-chat-muted-${myId}`);
    } catch {
      // Ignore storage restrictions.
    }
  }

  async function registerFirebasePushToken() {
    if (typeof window === "undefined" || !myId) return null;

    if (!("serviceWorker" in navigator)) {
      console.warn("Service workers are not supported in this browser.");
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing.");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn("Firebase Messaging is not supported in this browser.");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      await savePushToken(myId, token, "web");

      try {
        localStorage.setItem(`couplenest-fcm-token-${myId}`, token);
      } catch {
        // Ignore storage restrictions.
      }
    }

    return token || null;
  }

  async function enableNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }

    setNotificationBusy(true);
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        try {
          const token = await registerFirebasePushToken();
          if (token) {
            console.info("CoupleNest FCM token registered on this device.");
          }
        } catch (error) {
          console.error("Firebase push token registration failed:", error);
        }
      }
    } catch (error) {
      console.error("Notification permission request failed:", error);
    } finally {
      setNotificationBusy(false);
    }
  }

  function toggleNotificationSound() {
    const next = !notificationSound;
    setNotificationSound(next);
    try {
      if (myId) localStorage.setItem(`couplenest-chat-sound-${myId}`, next ? "1" : "0");
    } catch {
      // Ignore storage restrictions.
    }
  }

  async function showIncomingMessageNotification(message: {
    id: string;
    message?: string | null;
    image_url?: string | null;
    video_url?: string | null;
    audio_url?: string | null;
  }) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (muted) return;

    // If the user is already actively looking at CoupleNest Chat,
    // the in-app realtime UI is enough and a browser notification is noisy.
    if (document.visibilityState === "visible" && document.hasFocus()) return;

    if (notifiedMessageIdsRef.current.has(message.id)) return;
    notifiedMessageIdsRef.current.add(message.id);

    // Keep this set bounded during long-running sessions.
    if (notifiedMessageIdsRef.current.size > 200) {
      const oldest = notifiedMessageIdsRef.current.values().next().value;
      if (oldest) notifiedMessageIdsRef.current.delete(oldest);
    }

    let body = message.message?.trim() || "New message";
    if (!message.message?.trim()) {
      if (message.image_url) body = "📷 Photo";
      else if (message.video_url) body = "🎥 Video";
      else if (message.audio_url) body = "🎤 Voice message";
    }

    const notification = new Notification(partnerName || "Partner", {
      body,
      tag: `couplenest-message-${message.id}`,
      silent: !notificationSound,
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = "/chat";
      notification.close();
    };
  }

  function sendTestNotification() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      void enableNotifications();
      return;
    }

    const notification = new Notification(partnerName || "CoupleNest", {
      body: "Notifications are enabled ❤️",
      tag: "couplenest-test-notification",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  async function updatePrivacySetting(
    field: "hide_online_status" | "hide_last_seen",
    value: boolean
  ) {
    if (!myId) return;
    setSettingsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", myId);

      if (error) throw error;

      if (field === "hide_online_status") setHideOnlineStatus(value);
      if (field === "hide_last_seen") setHideLastSeen(value);
    } catch (error) {
      console.error("Privacy setting update failed:", error);
    } finally {
      setSettingsSaving(false);
    }
  }

  async function clearChat() {
    if (!myId || !partnerId) return;
    const confirmed = window.confirm(
      "Clear this conversation for both sides? This will permanently delete the messages."
    );
    if (!confirmed) return;

    setSettingsSaving(true);
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .or(
          `and(sender_id.eq.${myId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${myId})`
        );

      if (error) throw error;

      setMessages([]);
      setNewMessageCount(0);
      setHasNewMessage(false);
      setChatSettingsOpen(false);
    } catch (error) {
      console.error("Clear chat failed:", error);
      alert("Unable to clear this chat. Please check your Supabase permissions.");
    } finally {
      setSettingsSaving(false);
    }
  }

  // ==========================
  // Load Chat
  // ==========================
  async function loadChat() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setMyId(user.id);

    await supabase
      .from("profiles")
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq("id", user.id);

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("partner_id,hide_online_status,hide_last_seen")
      .eq("id", user.id)
      .single();

    if (error || !profile?.partner_id) {
      alert("No partner connected.");
      return;
    }

    setPartnerId(profile.partner_id);
    setHideOnlineStatus(Boolean(profile.hide_online_status));
    setHideLastSeen(Boolean(profile.hide_last_seen));

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
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  // Mark messages as seen
  await supabase
    .from("messages")
    .update({ seen: true })
    .eq("receiver_id", my)
    .eq("sender_id", partner)
    .eq("seen", false);

  // Generate signed URLs for private buckets
  // NOTE: `m` here is the raw row shape returned by Supabase (select("*")),
  // not yet reshaped into our `Message` type, so `any` is intentional here.
 const processedMessages = await Promise.all(
  (data ?? []).map(async (m: any) => {
    let imageUrl = null;
    let audioUrl = null;
    let videoUrl = null;

    // IMAGE
    if (m.image_url) {
      const { data, error } = await supabase.storage
        .from("chat-images")
        .createSignedUrl(m.image_url, 60 * 60);

      if (!error) {
        imageUrl = data?.signedUrl ?? null;
      }
    }

    // AUDIO
    if (m.audio_url) {
      const { data, error } = await supabase.storage
        .from("chat-audio")
        .createSignedUrl(m.audio_url, 60 * 60);

      if (!error) {
        audioUrl = data?.signedUrl ?? null;
      }
    }

    // VIDEO
    if (m.video_url) {
      const { data, error } = await supabase.storage
        .from("chat-videos")
        .createSignedUrl(m.video_url, 60 * 60);

      if (!error) {
        videoUrl = data?.signedUrl ?? null;
      }
    }

    return {
      ...m,

      image_url: imageUrl,
      audio_url: audioUrl,
      video_url: videoUrl,

      deleted_for: m.deleted_for ?? [],

      status: m.seen
        ? "seen"
        : m.receiver_id === my
        ? "delivered"
        : "sent",
    };
  })
);

const visibleMessages = (processedMessages as Message[]).filter((m: Message) => {
  if (!m.expires_at) return true;

  return new Date(m.expires_at).getTime() > Date.now();
});

setMessages(visibleMessages);

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
    const expiresAt = disappearAfter
  ? new Date(Date.now() + disappearAfter * 1000).toISOString()
  : null;

    const { error } = await supabase.from("messages").insert({
      sender_id: myId,
      receiver_id: partnerId,
      message: text.trim(),
      image_url: null,
      audio_url: null,
      video_url: null,
      reply_to_id: replyTo?.id ?? null,
      seen: false,
      disappear_after: disappearAfter,
      expires_at: expiresAt,
    });

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.channel(`typing-${partnerId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { user: myId, typing: false },
    });

    setText("");
    setReplyTo(null);
    setDisappearAfter(null);

    await loadMessages(myId, partnerId);
  }

  // ==========================
  // Save Edited Message
  // ==========================
  async function saveEditedMessage() {
    if (!editingMessage || !text.trim()) return;

    const { error } = await supabase
      .from("messages")
      .update({ message: text.trim(), edited: true })
      .eq("id", editingMessage.id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingMessage(null);
    setText("");

    await loadMessages(myId, partnerId);
  }

  function cancelEdit() {
    setEditingMessage(null);
    setText("");
  }

  function cancelReply() {
    setReplyTo(null);
  }

  // ==========================
  // Upload Image
  // ==========================
  async function uploadImage(file: File) {
    if (!partnerId || !myId) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(fileName, file);

    if (uploadError) {
      setUploading(false);
      alert(uploadError.message);
      return;
    }
    const expiresAt = disappearAfter
  ? new Date(Date.now() + disappearAfter * 1000).toISOString()
  : null;

   const { error } = await supabase
  .from("messages")
  .insert({
    sender_id: myId,
    receiver_id: partnerId,
    message: "",
    image_url: fileName,
    audio_url: null,
    video_url: null,
    view_once: viewOnce,
    reply_to_id: replyTo?.id ?? null,
    seen: false,
    disappear_after: disappearAfter,
    expires_at: expiresAt,
  });

    setUploading(false);
    setReplyTo(null);

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

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webm`;

    const { error: uploadError } = await supabase.storage
      .from("chat-audio")
      .upload(fileName, audioBlob);

    if (uploadError) {
      setUploading(false);
      alert(uploadError.message);
      return;
    }
const expiresAt = disappearAfter
  ? new Date(Date.now() + disappearAfter * 1000).toISOString()
  : null;
 const { error } = await supabase
  .from("messages")
  .insert({
    sender_id: myId,
    receiver_id: partnerId,
    message: "",
    image_url: null,
    audio_url: fileName,
    video_url: null,
    view_once: viewOnce,
    reply_to_id: replyTo?.id ?? null,
    seen: false,
    disappear_after: disappearAfter,
    expires_at: expiresAt,
  });

    setUploading(false);
    setReplyTo(null);

    if (error) {
      alert(error.message);
      return;
    }

    await loadMessages(myId, partnerId);
  }

  // ==========================
  // Voice Recording
  // ==========================
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
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

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  useEffect(() => {
    if (!recording) return;

    recordingStartedAtRef.current = Date.now();
    setRecordingSeconds(0);

    const timer = window.setInterval(() => {
      if (recordingStartedAtRef.current) {
        setRecordingSeconds(
          Math.floor((Date.now() - recordingStartedAtRef.current) / 1000)
        );
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [recording]);

  function cancelRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.onstop = () => {
      audioChunks.current = [];
      recorder.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
      mediaRecorderRef.current = null;
    };

    recorder.stop();
  }

  function formatRecordingTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  // ==========================
  // Typing
  // ==========================
  function handleTyping(value: string) {
    setText(value);

    supabase.channel(`typing-${partnerId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { user: myId, typing: value.length > 0 },
    });
  }

  // ==========================
  // Reactions
  // ==========================
  async function reactToMessage(messageId: string, emoji: string) {
    const target = messages.find((m) => m.id === messageId);
    const nextReaction = target?.reaction === emoji ? null : emoji;

    const { error } = await supabase
      .from("messages")
      .update({ reaction: nextReaction })
      .eq("id", messageId);

    if (!error) {
      await loadMessages(myId, partnerId);
    }
  }

  // ==========================
  // Reply / Edit / Copy / Delete
  // ==========================
  function startReply(msg: Message) {
    setReplyTo(msg);
    setEditingMessage(null);
    setMenuFor(null);
    inputRef.current?.focus();
  }

  function startEdit(msg: Message) {
    setEditingMessage(msg);
    setText(msg.message);
    setReplyTo(null);
    setMenuFor(null);
    inputRef.current?.focus();
  }

  async function copyMessage(msg: Message) {
    if (!msg.message) return;
    try {
      await navigator.clipboard.writeText(msg.message);
    } catch (err) {
      console.error(err);
    }
    setMenuFor(null);
  }

  async function deleteForMe(messageId: string) {
    const target = messages.find((m) => m.id === messageId);
    if (!target) return;

    const updated = Array.from(new Set([...(target.deleted_for || []), myId]));

    const { error } = await supabase
      .from("messages")
      .update({ deleted_for: updated })
      .eq("id", messageId);

    setMenuFor(null);

    if (!error) {
      await loadMessages(myId, partnerId);
    }
  }

  async function deleteForEveryone(messageId: string) {
    const { error } = await supabase
      .from("messages")
      .update({
        deleted_for_everyone: true,
        message: "",
        image_url: null,
        audio_url: null,
        video_url: null,
        reaction: null,
      })
      .eq("id", messageId);

    setMenuFor(null);

    if (!error) {
      await loadMessages(myId, partnerId);
    }
  }
  async function uploadVideo(file: File) {
  if (!myId || !partnerId) return;

  setUploading(true);

  const ext = file.name.split(".").pop();

  const fileName =
    `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${ext}`;

  const { error: uploadError } =
    await supabase.storage
      .from("chat-videos")
      .upload(fileName, file);

  if (uploadError) {
    setUploading(false);
    alert(uploadError.message);
    return;
  }
  const expiresAt = disappearAfter
  ? new Date(Date.now() + disappearAfter * 1000).toISOString()
  : null;

  const { error } = await supabase
  .from("messages")
  .insert({
    sender_id: myId,
    receiver_id: partnerId,
    message: "",
    image_url: null,
    audio_url: null,
    video_url: fileName,
    view_once: viewOnce,
    reply_to_id: replyTo?.id ?? null,
    disappear_after: disappearAfter,
    expires_at: expiresAt,
    seen: false,
  });
  setUploading(false);
  setReplyTo(null);

  if (error) {
    alert(error.message);
    return;
  }

  loadMessages(myId, partnerId);
}

  function addEmoji(emojiData: any) {
    setText((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  }

  function startLongPress(messageId: string) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setMenuFor(messageId);
      longPressTimer.current = null;
    }, 520);
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function scrollToMessage(id: string) {
    const el = messageRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-pink-400");
    setTimeout(() => el.classList.remove("ring-2", "ring-pink-400"), 1200);
  }

  function formatMessageDay(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(date, today)) return "Today";
    if (sameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
    });
  }

  function goToSearchMatch(direction: 1 | -1) {
    if (!searchQuery.trim() || displayedMessages.length === 0) return;
    const next = (searchMatchIndex + direction + displayedMessages.length) % displayedMessages.length;
    setSearchMatchIndex(next);
    scrollToMessage(displayedMessages[next].id);
  }

  // Derived: visible + searched messages
  // ==========================
  const visibleMessages = messages.filter(
    (m) => !(m.deleted_for || []).includes(myId)
  );

  const displayedMessages = searchQuery.trim()
    ? visibleMessages.filter((m) =>
        m.message?.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : visibleMessages;

  return (
    <main className="fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-pink-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.055),transparent_38%)]" />
      </div>
      {/* Header */}
<header className="relative z-30 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] bg-zinc-950/75 px-3 py-2.5 backdrop-blur-2xl sm:px-4 sm:py-3">
        <div>
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-pink-400/20 bg-gradient-to-br from-pink-500/25 via-fuchsia-500/10 to-zinc-800 shadow-[0_0_24px_rgba(236,72,153,0.12)] sm:h-11 sm:w-11">
              <span className="text-lg">❤️</span>
              <span className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 ${online ? "bg-emerald-400" : "bg-zinc-500"}`} />
            </div>
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="min-w-0 text-left outline-none"
              aria-label="Open chat info"
            >
              <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-white sm:text-base">
                {partnerName || "Private Chat"}
              </h1>

              <p className="mt-0.5 truncate text-[11px] font-medium text-zinc-400 sm:text-xs">
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
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.045] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white sm:h-11 sm:w-11"
            title="Search messages"
          >
            <Search size={20} />
          </button>
          <button
            type="button"
            onClick={() => setChatSettingsOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.045] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white sm:h-11 sm:w-11"
            title="Chat settings"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {profileOpen && (
        <>
          <button
            type="button"
            aria-label="Close chat info"
            onClick={() => setProfileOpen(false)}
            className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
          />

          <aside
            className="fixed inset-x-0 bottom-0 z-[90] max-h-[88dvh] overflow-y-auto rounded-t-[30px] border border-white/[0.08] bg-[#101015]/98 shadow-2xl shadow-black/70 backdrop-blur-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[390px] sm:max-h-none sm:rounded-none sm:rounded-l-[30px]"
            role="dialog"
            aria-modal="true"
            aria-label="Chat information"
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#101015]/90 px-4 py-3 backdrop-blur-xl sm:px-5">
              <div>
                <p className="text-sm font-semibold text-white">Chat info</p>
                <p className="text-[11px] text-zinc-500">Your private CoupleNest conversation</p>
              </div>
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-zinc-300 transition hover:bg-white/[0.09] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pb-8 pt-6 sm:px-5">
              <div className="flex flex-col items-center text-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-pink-400/20 bg-gradient-to-br from-pink-500/25 via-fuchsia-500/10 to-zinc-800 shadow-[0_0_45px_rgba(236,72,153,0.16)]">
                  <span className="text-4xl">❤️</span>
                  <span className={`absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border-[3px] border-[#101015] ${online ? "bg-emerald-400" : "bg-zinc-500"}`} />
                </div>
                <h2 className="mt-4 max-w-full truncate text-xl font-bold text-white">{partnerName || "Partner"}</h2>
                <p className="mt-1 text-xs text-zinc-500">{online ? "Online now" : lastSeen ? `Last seen ${new Date(lastSeen).toLocaleString()}` : "Offline"}</p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { label: "Photos", value: messages.filter((m) => !!m.image_url).length, icon: Images, tab: "photos" as const },
                  { label: "Videos", value: messages.filter((m) => !!m.video_url).length, icon: Video, tab: "videos" as const },
                  { label: "Audio", value: messages.filter((m) => !!m.audio_url).length, icon: Music2, tab: "audio" as const },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => { setMediaGalleryTab(item.tab); setMediaGalleryOpen(true); }}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.035] px-2 py-3 text-center transition hover:border-pink-400/20 hover:bg-pink-500/[0.05] active:scale-[0.98]"
                    >
                      <Icon className="mx-auto text-pink-300" size={17} />
                      <p className="mt-1.5 text-base font-bold text-white">{item.value}</p>
                      <p className="text-[10px] text-zinc-500">{item.label}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.035]">
                <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">Private conversation</p>
                    <p className="text-[11px] text-zinc-500">Only you and your partner can access this chat.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Partner connection</p>
                    <p className="text-[11px] text-zinc-500">Realtime status and messages are enabled.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {mediaGalleryOpen && (
        <>
          <button
            type="button"
            aria-label="Close media gallery"
            onClick={() => setMediaGalleryOpen(false)}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />
          <section
            className="fixed inset-x-0 bottom-0 z-[110] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[30px] border border-white/[0.08] bg-[#0d0d12]/98 shadow-2xl shadow-black/80 backdrop-blur-2xl sm:inset-4 sm:bottom-4 sm:mx-auto sm:max-w-4xl sm:rounded-[30px]"
            role="dialog"
            aria-modal="true"
            aria-label="Chat media gallery"
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-base font-semibold text-white">Shared media</h2>
                <p className="mt-0.5 text-[11px] text-zinc-500">Photos, videos and voice messages from this chat</p>
              </div>
              <button type="button" onClick={() => setMediaGalleryOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-zinc-300 hover:bg-white/[0.09] hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-white/[0.06] px-4 py-3 [scrollbar-width:none] sm:px-6">
              {[
                ["all", "All"],
                ["photos", "Photos"],
                ["videos", "Videos"],
                ["audio", "Audio"],
              ].map(([tab, label]) => (
                <button key={tab} type="button" onClick={() => setMediaGalleryTab(tab as typeof mediaGalleryTab)} className={`rounded-full px-4 py-2 text-xs font-medium transition ${mediaGalleryTab === tab ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" : "bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-white"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
              {(() => {
                const mediaMessages = messages.filter((m) => {
                  if (m.deleted_for_everyone || m.deleted_for?.includes(myId)) return false;
                  if (mediaGalleryTab === "photos") return !!m.image_url;
                  if (mediaGalleryTab === "videos") return !!m.video_url;
                  if (mediaGalleryTab === "audio") return !!m.audio_url;
                  return !!m.image_url || !!m.video_url || !!m.audio_url;
                });
                if (!mediaMessages.length) {
                  return <div className="flex min-h-56 flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-300"><Images size={24} /></div><p className="mt-4 text-sm font-medium text-white">No {mediaGalleryTab === "all" ? "shared media" : mediaGalleryTab} yet</p><p className="mt-1 text-xs text-zinc-500">Media shared in this conversation will appear here.</p></div>;
                }
                return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{mediaMessages.map((m) => (
                  <div key={m.id} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.035]">
                    {m.image_url ? (
                      <button type="button" onClick={() => { setPreviewImage(m.image_url || ""); setPreviewImageMessage(m); setMediaGalleryOpen(false); }} className="group relative block aspect-square w-full overflow-hidden bg-zinc-900">
                        <Image src={m.image_url} alt={"Shared photo"} fill unoptimized className="object-cover transition duration-300 group-hover:scale-105" />
                        <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                      </button>
                    ) : m.video_url ? (
                      <button type="button" onClick={() => { setPreviewVideo(m.video_url || ""); setPreviewVideoMessage(m); setMediaGalleryOpen(false); }} className="relative block aspect-square w-full overflow-hidden bg-zinc-900">
                        <video src={m.video_url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/15"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"><Video size={19} /></span></span>
                      </button>
                    ) : (
                      <div className="p-3">
                        <div className="flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/10 to-violet-500/10 text-pink-300"><Music2 size={28} /></div>
                        <audio controls preload="metadata" src={m.audio_url || undefined} className="mt-2 w-full" />
                      </div>
                    )}
                    <div className="truncate px-3 py-2 text-[10px] text-zinc-500">{new Date(m.created_at).toLocaleDateString()} · {m.sender_id === myId ? "You" : partnerName || "Partner"}</div>
                  </div>
                ))}</div>;
              })()}
            </div>
          </section>
        </>
      )}

      {chatSettingsOpen && (
        <>
          <button
            type="button"
            aria-label="Close chat settings"
            onClick={() => setChatSettingsOpen(false)}
            className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm"
          />

          <aside
            className="fixed inset-x-0 bottom-0 z-[100] max-h-[90dvh] overflow-y-auto rounded-t-[30px] border border-white/[0.08] bg-[#101015]/98 shadow-2xl shadow-black/70 backdrop-blur-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[390px] sm:max-h-none sm:rounded-none sm:rounded-l-[30px]"
            role="dialog"
            aria-modal="true"
            aria-label="Chat settings"
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#101015]/90 px-4 py-3 backdrop-blur-xl sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300">
                  <Settings2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Chat settings</p>
                  <p className="text-[11px] text-zinc-500">Private controls for this conversation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatSettingsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-zinc-300 transition hover:bg-white/[0.09] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 px-4 pb-8 pt-5 sm:px-5">
              <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.035]">
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Notifications</p>
                </div>

                <div className="flex items-center gap-3 px-4 py-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300">
                    {notificationPermission === "granted" ? <BellRing size={19} /> : <Bell size={19} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">Browser notifications</p>
                    <p className="text-[11px] text-zinc-500">
                      {notificationPermission === "granted"
                        ? "Enabled on this browser."
                        : notificationPermission === "denied"
                          ? "Blocked. Allow notifications from your browser site settings."
                          : notificationPermission === "unsupported"
                            ? "This browser does not support notifications."
                            : "Allow CoupleNest to notify you about new messages."}
                    </p>
                  </div>
                  {notificationPermission === "granted" ? (
                    <button
                      type="button"
                      onClick={sendTestNotification}
                      className="rounded-xl border border-pink-400/10 bg-pink-500/10 px-3 py-2 text-[11px] font-semibold text-pink-200 transition hover:bg-pink-500/15"
                    >
                      Test
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={notificationBusy || notificationPermission === "denied" || notificationPermission === "unsupported"}
                      onClick={enableNotifications}
                      className="rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-600 px-3 py-2 text-[11px] font-semibold text-white shadow-lg shadow-pink-500/10 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {notificationBusy ? "..." : "Enable"}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={toggleNotificationSound}
                  className="flex w-full items-center gap-3 border-t border-white/[0.06] px-4 py-4 text-left transition hover:bg-white/[0.04]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                    <Bell size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-white">Notification sound</span>
                    <span className="block text-[11px] text-zinc-500">Local preference for this device.</span>
                  </span>
                  <span className={`h-5 w-9 rounded-full p-0.5 transition ${notificationSound ? "bg-pink-500" : "bg-zinc-700"}`}>
                    <span className={`block h-4 w-4 rounded-full bg-white transition ${notificationSound ? "translate-x-4" : "translate-x-0"}`} />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.04]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    {muted ? <BellOff size={19} /> : <Bell size={19} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-white">Mute notifications</span>
                    <span className="block text-[11px] text-zinc-500">Only affects notifications on this device</span>
                  </span>
                  <span className={`h-5 w-9 rounded-full p-0.5 transition ${muted ? "bg-pink-500" : "bg-zinc-700"}`}>
                    <span className={`block h-4 w-4 rounded-full bg-white transition ${muted ? "translate-x-4" : "translate-x-0"}`} />
                  </span>
                </button>

                <div className="border-t border-white/[0.06]">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                      <Clock3 size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">Disappearing messages</p>
                      <p className="text-[11px] text-zinc-500">Choose how long new messages stay visible.</p>
                    </div>
                    <select
                      value={disappearAfter ?? ""}
                      onChange={(e) => setDisappearAfter(e.target.value ? Number(e.target.value) : null)}
                      className="max-w-[105px] rounded-xl border border-white/[0.07] bg-zinc-900 px-2 py-2 text-[11px] text-zinc-300 outline-none"
                    >
                      <option value="">Off</option>
                      <option value="3600">1 hour</option>
                      <option value="86400">24 hours</option>
                      <option value="604800">7 days</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.035]">
                <div className="px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Privacy</p>
                </div>

                <button
                  type="button"
                  disabled={settingsSaving}
                  onClick={() => updatePrivacySetting("hide_online_status", !hideOnlineStatus)}
                  className="flex w-full items-center gap-3 border-t border-white/[0.06] px-4 py-4 text-left transition hover:bg-white/[0.04] disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <EyeOff size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-white">Hide online status</span>
                    <span className="block text-[11px] text-zinc-500">Your online indicator can be hidden.</span>
                  </span>
                  <span className={`h-5 w-9 rounded-full p-0.5 transition ${hideOnlineStatus ? "bg-pink-500" : "bg-zinc-700"}`}>
                    <span className={`block h-4 w-4 rounded-full bg-white transition ${hideOnlineStatus ? "translate-x-4" : "translate-x-0"}`} />
                  </span>
                </button>

                <button
                  type="button"
                  disabled={settingsSaving}
                  onClick={() => updatePrivacySetting("hide_last_seen", !hideLastSeen)}
                  className="flex w-full items-center gap-3 border-t border-white/[0.06] px-4 py-4 text-left transition hover:bg-white/[0.04] disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                    <Clock3 size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-white">Hide last seen</span>
                    <span className="block text-[11px] text-zinc-500">Your last active time can be hidden.</span>
                  </span>
                  <span className={`h-5 w-9 rounded-full p-0.5 transition ${hideLastSeen ? "bg-pink-500" : "bg-zinc-700"}`}>
                    <span className={`block h-4 w-4 rounded-full bg-white transition ${hideLastSeen ? "translate-x-4" : "translate-x-0"}`} />
                  </span>
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-red-500/10 bg-red-500/[0.035]">
                <button
                  type="button"
                  disabled={settingsSaving || messages.length === 0}
                  onClick={clearChat}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-red-500/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                    <Trash2 size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-red-300">Clear chat</span>
                    <span className="block text-[11px] text-zinc-500">Permanently removes the conversation messages.</span>
                  </span>
                </button>
              </div>

              <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.04] px-4 py-3">
                <ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-300" />
                <p className="text-[11px] leading-5 text-zinc-400">
                  CoupleNest keeps this chat private. Settings above use your existing profile/privacy fields or local device preferences.
                </p>
              </div>
            </div>
          </aside>
        </>
      )}

      {searchOpen && (
        <div className="relative z-20 border-b border-white/[0.06] bg-zinc-950/75 p-2.5 backdrop-blur-xl sm:p-3">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchMatchIndex(0); }}
                placeholder="Search messages..."
                className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.045] py-3 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-pink-500/30 focus:ring-2 focus:ring-pink-500/10"
                autoFocus
              />
            </div>
            {searchQuery.trim() && (
              <>
                <span className="hidden shrink-0 text-[11px] text-zinc-500 sm:block">
                  {displayedMessages.length ? `${searchMatchIndex + 1}/${displayedMessages.length}` : "0/0"}
                </span>
                <button type="button" onClick={() => goToSearchMatch(-1)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.045] text-zinc-300">↑</button>
                <button type="button" onClick={() => goToSearchMatch(1)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.045] text-zinc-300">↓</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={messageListRef} className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3 pb-28 scroll-smooth sm:px-4 sm:py-4 sm:pb-32 scrollbar-hide">
        {chatInitialLoading ? (
          <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-full border border-pink-400/15 bg-pink-500/10 text-2xl shadow-[0_0_30px_rgba(236,72,153,0.12)]">❤️</div>
            <div className="h-3 w-28 animate-pulse rounded-full bg-white/[0.08]" />
            <div className="mt-2 h-2.5 w-40 animate-pulse rounded-full bg-white/[0.05]" />
          </div>
        ) : displayedMessages.length === 0 ? (
          <div className="mx-auto mt-20 flex max-w-xs flex-col items-center text-center text-zinc-500">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-pink-500/10 bg-pink-500/5 text-2xl">❤️</div>
            {searchQuery.trim() ? "No messages found" : "No messages yet ❤️"}
          </div>
        ) : (
          <>
            {typing && (
              <div className="mb-3 flex items-end gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/[0.06] bg-zinc-900/90 px-3 py-2 shadow-lg backdrop-blur-xl">
                  <span className="text-[11px] font-medium text-zinc-400">typing</span>
                  <span className="flex gap-0.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-400" />
                  </span>
                </div>
              </div>
            )}

            {hasNewMessage && (
              <button type="button" onClick={jumpToLatestMessages} className="sticky bottom-3 left-1/2 z-20 mx-auto mb-2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-pink-400/20 bg-zinc-900/95 px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-zinc-800 active:scale-95">
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px]">{newMessageCount > 99 ? "99+" : newMessageCount}</span>
                New message{newMessageCount === 1 ? "" : "s"}
                <span className="text-pink-300">↓</span>
              </button>
            )}

            {showScrollToBottom && !hasNewMessage && (
              <button
                type="button"
                onClick={jumpToLatestMessages}
                aria-label="Scroll to latest messages"
                className="sticky bottom-3 left-1/2 z-20 mx-auto mb-2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-zinc-900/95 text-zinc-200 shadow-[0_10px_35px_rgba(0,0,0,0.4)] backdrop-blur-xl transition hover:bg-zinc-800 active:scale-95"
              >
                ↓
              </button>
            )}

            {displayedMessages.map((msg, index) => {
            const previousMessage = displayedMessages[index - 1];
            const showDateSeparator = !previousMessage || formatMessageDay(previousMessage.created_at) !== formatMessageDay(msg.created_at);
            const repliedMessage = msg.reply_to_id
              ? messages.find((m) => m.id === msg.reply_to_id)
              : null;

            const isMine = msg.sender_id === myId;
            const diff =
              Date.now() - new Date(msg.created_at).getTime();
            const canDeleteForEveryone =
              diff < 15 * 60 * 1000;
              const isDeleted = msg.deleted_for_everyone;
            return (
              <Fragment key={msg.id}>
              {showDateSeparator && (
                <div className="my-4 flex items-center justify-center">
                  <span className="rounded-full border border-white/[0.06] bg-zinc-900/80 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 shadow-lg">
                    {formatMessageDay(msg.created_at)}
                  </span>
                </div>
              )}
              <div
                key={msg.id + "-bubble"}
                ref={(el) => {
                  messageRefs.current[msg.id] = el;
                }}
                className={`mb-2.5 flex sm:mb-3 ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isDeleted) setMenuFor(msg.id);
                  }}
                  onTouchStart={() => {
                    if (!isDeleted) startLongPress(msg.id);
                  }}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  onTouchCancel={cancelLongPress}
                  className={`group relative max-w-[88%] animate-in fade-in slide-in-from-bottom-1 overflow-visible rounded-[20px] px-3.5 py-2.5 transition duration-200 sm:max-w-[72%] sm:px-4 sm:py-3 ${
                    isMine
                      ? "rounded-br-md border border-pink-400/10 bg-gradient-to-br from-pink-600 to-fuchsia-600 shadow-[0_8px_30px_rgba(236,72,153,0.10)]"
                      : "rounded-bl-md border border-white/[0.06] bg-zinc-900/90 shadow-[0_8px_25px_rgba(0,0,0,0.18)]"
                  }`}
                >
                  {/* "..." menu trigger */}
                  {!isDeleted && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuFor(menuFor === msg.id ? null : msg.id);
                      }}
                      className="absolute -right-1.5 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-zinc-950/95 text-zinc-400 opacity-80 shadow-lg transition hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <MoreVertical size={14} />
                    </button>
                  )}

                  {/* Per-message menu */}
                  {menuFor === msg.id && !isDeleted && (
  <>
    <button
      type="button"
      aria-label="Close message actions"
      onClick={() => setMenuFor(null)}
      className="fixed inset-0 z-[90] bg-black/35 backdrop-blur-[2px] sm:hidden"
    />
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+76px)] z-[100] overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#111116]/95 text-sm shadow-2xl shadow-black/60 backdrop-blur-2xl sm:absolute sm:right-0 sm:top-7 sm:bottom-auto sm:z-50 sm:w-52 sm:rounded-2xl"
    >
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
    {/* Quick Reactions */}
    <div className="flex items-center justify-around border-b border-white/[0.06] px-3 py-3">
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            reactToMessage(msg.id, emoji);
            setMenuFor(null);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition active:scale-90 hover:scale-125 hover:bg-white/5"
        >
          {emoji}
        </button>
      ))}
    </div>

    {/* Reply */}
    <button
      onClick={() => {
        startReply(msg);
        setMenuFor(null);
      }}
      className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.06] active:bg-white/[0.08] sm:min-h-0 sm:py-2"
    >
      <Reply size={16} />
      Reply
    </button>

    {/* Copy */}
    {msg.message && (
      <button
        onClick={() => {
          copyMessage(msg);
          setMenuFor(null);
        }}
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.06] active:bg-white/[0.08] sm:min-h-0 sm:py-2"
      >
        <Copy size={16} />
        Copy
      </button>
    )}

    {/* Edit */}
    {isMine && msg.message && (
      <button
        onClick={() => {
          startEdit(msg);
          setMenuFor(null);
        }}
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.06] active:bg-white/[0.08] sm:min-h-0 sm:py-2"
      >
        <Pencil size={16} />
        Edit
      </button>
    )}

    {/* Delete for me */}
    <button
      onClick={() => {
        deleteForMe(msg.id);
        setMenuFor(null);
      }}
      className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left text-red-400 transition hover:bg-red-500/10 active:bg-red-500/15 sm:min-h-0 sm:py-2"
    >
      <Trash2 size={16} />
      Delete for me
    </button>

    {/* Delete for everyone (15 min) */}
    {isMine && canDeleteForEveryone && (
      <button
        onClick={() => {
          deleteForEveryone(msg.id);
          setMenuFor(null);
        }}
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left text-red-400 transition hover:bg-red-500/10 active:bg-red-500/15 sm:min-h-0 sm:py-2"
      >
        <Trash2 size={16} />
        Delete for everyone
      </button>
    )}
    </div>
  </>
)}

                  {/* Reply preview quoted inside bubble */}
                  {repliedMessage && !isDeleted && (
                    <button
                      onClick={() => scrollToMessage(repliedMessage.id)}
                      className="mb-2 block w-full overflow-hidden rounded-xl border border-white/[0.07] border-l-2 border-l-pink-300 bg-black/20 px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-black/30 active:scale-[0.99]"
                    >
                      {repliedMessage.deleted_for_everyone
                        ? "Original message deleted"
                        : repliedMessage.message ||
                          (repliedMessage.image_url
                            ? "📷 Photo"
                            : repliedMessage.audio_url
                            ? "🎤 Voice message"
                            : "Message")}
                    </button>
                  )}

                  {isDeleted ? (
                    <p className="italic text-zinc-400 text-sm">
                      This message was deleted
                    </p>
                  ) : (
                    <>
                      {msg.image_url && (
  <Image
    src={msg.image_url}
    alt="Chat"
    width={500}
    height={500}
    sizes="100vw"
    unoptimized
    className="mb-2 max-h-[60vh] w-full cursor-pointer rounded-2xl object-cover transition hover:opacity-95"
    onClick={() => {
      setPreviewImage(msg.image_url!);
      setPreviewImageMessage(msg);
    }}
  />
)}

{msg.video_url && (
  <div className="relative mb-2 group">
    <video
      controls
      className="max-h-[60vh] w-full rounded-2xl object-cover"
    >
      <source
        src={msg.video_url}
        type="video/mp4"
      />
    </video>
    <button
      type="button"
      onClick={() => {
        setPreviewVideo(msg.video_url!);
        setPreviewVideoMessage(msg);
      }}
      className="absolute top-2 right-2 bg-black/60 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition"
      title="Open fullscreen"
    >
      <Maximize2 size={16} />
    </button>
  </div>
)}
{msg.audio_url && (
  <div className="mb-2 w-full max-w-[320px] rounded-2xl border border-white/[0.07] bg-black/20 p-2.5 shadow-inner sm:p-3">
    <div className="mb-2 flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-300">
        <Mic size={16} />
      </div>
      <div className="flex min-w-0 flex-1 items-end gap-1 overflow-hidden" aria-hidden="true">
        {[8,14,10,18,12,22,15,10,20,13,17,9,16,23,12,18,10,14,20,11,16,8,13,19].map((h, i) => (
          <span key={i} className="w-1 shrink-0 rounded-full bg-pink-400/55" style={{ height: `${h}px` }} />
        ))}
      </div>
    </div>
    <audio controls className="block h-8 w-full" preload="metadata">
      <source src={msg.audio_url} type="audio/webm" />
    </audio>
  </div>
)}

{msg.message && (
  <p className="break-words">
    {msg.message}
  </p>
)}
                    </>
                  )}

                <div className="mt-1.5 flex items-center justify-end gap-1.5 text-[10px] font-medium opacity-70 sm:text-[11px]">

  {msg.edited && !isDeleted && (
    <span>edited</span>
  )}

  {msg.expires_at && !isDeleted && (
    <Clock3
      size={13}
      className="text-yellow-400"
      aria-label="Disappearing message"
    />
  )}

  <span>
    {new Date(msg.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </span>

  {isMine && (
    <span className="font-bold">
      {msg.status === "sending" && <span>⏳</span>}
      {msg.status === "sent" && <span>✓</span>}
      {msg.status === "delivered" && <span>✓✓</span>}
      {msg.status === "seen" && (
        <span className="text-blue-400">✓✓</span>
      )}
    </span>
  )}

</div>
                  {msg.reaction && !isDeleted && (
                    <div className="mt-1 inline-flex min-h-6 items-center rounded-full border border-white/[0.08] bg-black/25 px-2 text-sm shadow-sm">
                      {msg.reaction}
                    </div>
                  )}
                </div>
              </div>
              </Fragment>
            );
          })}
          </>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* Reply / Edit preview bar above input */}
      {(replyTo || editingMessage) && (
        <div className="relative z-20 flex shrink-0 items-start justify-between gap-3 border-t border-white/[0.06] bg-zinc-950/90 px-3 py-2.5 backdrop-blur-xl sm:px-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-pink-400 font-semibold">
              {editingMessage ? "Editing message" : `Replying to ${replyTo?.sender_id === myId ? "yourself" : partnerName}`}
            </p>
            <p className="text-sm text-zinc-300 truncate">
              {editingMessage
                ? editingMessage.message
                : replyTo?.message ||
                  (replyTo?.image_url ? "📷 Photo" : replyTo?.audio_url ? "🎤 Voice message" : "")}
            </p>
          </div>
          <button
            type="button"
            onClick={editingMessage ? cancelEdit : cancelReply}
            className="text-zinc-400 hover:text-white transition mt-1"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Input */}
      <div
  className="relative z-30 flex shrink-0 items-center gap-1.5 overflow-visible border-t border-white/[0.06] bg-zinc-950/90 px-2 pt-2 pb-[max(env(safe-area-inset-bottom),8px)] backdrop-blur-2xl sm:gap-2 sm:px-3 sm:py-3"
>
        {/* Hidden File Input */}
        <input
    ref={fileInputRef}
    hidden
    type="file"
    accept="image/*,video/*"
    onChange={(e)=>{

        const file=e.target.files?.[0];

        if(!file) return;

        if(file.type.startsWith("image")){

            uploadImage(file);

        }else if(file.type.startsWith("video")){

            uploadVideo(file);

        }

    }}
/>

        <input
          ref={cameraInputRef}
          hidden
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.currentTarget.value = "";
            if (!file) return;
            uploadImage(file);
          }}
        />

        {!editingMessage && (
          <div className="relative shrink-0">
            <button
              type="button"
              disabled={uploading}
              onClick={() => setShowAttachmentSheet((v) => !v)}
              aria-label="Attachments"
              aria-expanded={showAttachmentSheet}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.045] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white active:scale-95 disabled:opacity-50 sm:h-11 sm:w-11"
            >
              <Paperclip size={21} />
            </button>

            {showAttachmentSheet && (
              <>
                <button
                  type="button"
                  aria-label="Close attachment menu"
                  className="fixed inset-0 z-40 cursor-default bg-black/10"
                  onClick={() => setShowAttachmentSheet(false)}
                />

                <div className="absolute bottom-[calc(100%+10px)] left-0 z-50 w-[min(320px,calc(100vw-20px))] overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:w-80">
                  <div className="mb-2 px-2 py-1">
                    <p className="text-sm font-semibold text-white">Share something</p>
                    <p className="text-[11px] text-zinc-500">Private media stays inside your chat</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => {
                        setShowAttachmentSheet(false);
                        fileInputRef.current?.click();
                      }}
                      className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500/15 text-pink-300">
                        <Images size={20} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-white">Gallery</span>
                        <span className="block text-[10px] text-zinc-500">Photo or video</span>
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => {
                        setShowAttachmentSheet(false);
                        cameraInputRef.current?.click();
                      }}
                      className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
                        <Camera size={20} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-white">Camera</span>
                        <span className="block text-[10px] text-zinc-500">Take a photo</span>
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={recording || uploading}
                      onClick={() => {
                        setShowAttachmentSheet(false);
                        startRecording();
                      }}
                      className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                        <Mic size={20} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-white">Voice</span>
                        <span className="block text-[10px] text-zinc-500">Record a message</span>
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => {
                        setShowAttachmentSheet(false);
                        fileInputRef.current?.click();
                      }}
                      className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                        <Video size={20} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-white">Video</span>
                        <span className="block text-[10px] text-zinc-500">Choose a video</span>
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
       <label
className="
hidden
sm:flex
items-center
gap-2
text-xs
whitespace-nowrap
"
>
  <label className="flex sm:hidden items-center">

<input
type="checkbox"
checked={viewOnce}
onChange={(e)=>setViewOnce(e.target.checked)}
/>

</label>
  <input
    type="checkbox"
    checked={viewOnce}
    onChange={(e) => setViewOnce(e.target.checked)}
  />
  👁 View Once
</label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.045] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white sm:h-11 sm:w-11"
          >
            <Smile size={22} />
          </button>

          {showEmoji && (
            <div className="absolute bottom-full mb-2 left-0 z-50">
              <EmojiPicker onEmojiClick={addEmoji} theme={"dark" as any} height={350} width={300} />
            </div>
          )}
        </div>
        <div className="relative">
  <select
    value={disappearAfter ?? ""}
    onChange={(e) =>
      setDisappearAfter(
        e.target.value ? Number(e.target.value) : null
      )
    }
    className="h-10 max-w-[74px] shrink-0 rounded-full border border-white/[0.06] bg-white/[0.045] px-2 text-[11px] text-zinc-300 outline-none transition hover:bg-white/[0.08] sm:h-11 sm:max-w-none sm:px-3 sm:text-sm"
  >
    <option value="">♾️ Off</option>
    <option value="3600">🕐 1 Hour</option>
    <option value="86400">📅 24 Hours</option>
    <option value="604800">🗓️ 7 Days</option>
  </select>
</div>

        {!editingMessage && (
          recording ? (
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-red-500/15 bg-red-500/[0.07] px-2 py-1.5 sm:gap-3 sm:px-3">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                <span className="absolute h-2.5 w-2.5 animate-pulse rounded-full bg-red-400" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-red-200">Recording voice</span>
                  <span className="font-mono text-xs tabular-nums text-red-300">{formatRecordingTime(recordingSeconds)}</span>
                </div>
                <div className="mt-1 flex h-4 items-center gap-1 overflow-hidden">
                  {[7,11,16,9,19,13,8,15,21,10,17,12,20,8,14,18,11,16,9,13].map((h, i) => (
                    <span key={i} className="w-1 shrink-0 rounded-full bg-red-400/60 animate-pulse" style={{ height: `${h}px`, animationDelay: `${i * 45}ms` }} />
                  ))}
                </div>
              </div>
              <button type="button" onClick={cancelRecording} aria-label="Cancel recording" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white">
                <X size={18} />
              </button>
              <button type="button" onClick={stopRecording} aria-label="Send voice message" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/20 transition hover:scale-105 active:scale-95">
                <Send size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              aria-label="Record voice message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 transition hover:bg-emerald-500/25 hover:scale-105 active:scale-95 sm:h-11 sm:w-11"
            >
              <Mic size={21} />
            </button>
          )
        )}

        <input
          ref={inputRef}
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              editingMessage ? saveEditedMessage() : sendMessage();
            }
            if (e.key === "Escape") {
              editingMessage ? cancelEdit() : cancelReply();
            }
          }}
          placeholder={editingMessage ? "Edit message..." : "Type a message..."}
          className="min-w-0 flex-1 rounded-full border border-white/[0.07] bg-white/[0.045] px-4 py-2.5 text-[14px] text-white outline-none transition placeholder:text-zinc-500 focus:border-pink-500/30 focus:bg-white/[0.06] focus:ring-2 focus:ring-pink-500/10 sm:py-3 sm:text-sm"
        />

        <button
          type="button"
          disabled={uploading}
          onClick={editingMessage ? saveEditedMessage : sendMessage}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white shadow-[0_8px_25px_rgba(236,72,153,0.25)] transition duration-200 active:scale-95 hover:scale-105 hover:shadow-[0_10px_30px_rgba(236,72,153,0.35)] disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
        >
          {uploading ? (
            <Loader2 size={22} className="animate-spin" />
          ) : editingMessage ? (
            <Check size={22} />
          ) : (
            <Send size={22} />
          )}
        </button>
      </div>

      {/* Image Preview */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="absolute top-5 right-5 flex items-center gap-3">
            {previewImageMessage && !previewImageMessage.deleted_for_everyone && (
              <>
                <button
                  onClick={() => {
                    startReply(previewImageMessage);
                    setPreviewImage("");
                    setPreviewImageMessage(null);
                  }}
                  className="bg-zinc-800/80 hover:bg-zinc-700 rounded-xl p-3 transition"
                  title="Reply"
                >
                  <Reply size={22} />
                </button>
                <button
                  onClick={async () => {
                    await deleteForMe(previewImageMessage.id);
                    setPreviewImage("");
                    setPreviewImageMessage(null);
                  }}
                  className="bg-zinc-800/80 hover:bg-zinc-700 rounded-xl p-3 transition text-red-400"
                  title="Delete for me"
                >
                  <Trash2 size={22} />
                </button>
              </>
            )}
            <button
              onClick={async () => {
                if (
                  previewImageMessage?.view_once &&
                  previewImageMessage.sender_id !== myId
                ) {
                  const viewed = [
                    ...(previewImageMessage.viewed_by || []),
                    myId,
                  ];

                  await supabase
                    .from("messages")
                    .update({
                      viewed_by: viewed,
                      deleted_for: [
                        ...(previewImageMessage.deleted_for || []),
                        myId,
                      ],
                    })
                    .eq("id", previewImageMessage.id);

                  await loadMessages(myId, partnerId);
                }

                setPreviewImage("");
                setPreviewImageMessage(null);
              }}
              className="bg-zinc-800/80 hover:bg-zinc-700 rounded-xl p-3 transition"
              title="Close"
            >
              <X size={22} />
            </button>
          </div>

          <Image
            src={previewImage}
            alt="Preview"
            width={1200}
            height={1200}
            unoptimized
            className="max-h-[85vh] max-w-[96vw] sm:max-h-[90vh] sm:max-w-[90vw] 
            rounded-xl h-auto w-auto"
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

      {/* Video Preview */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="absolute top-5 right-5 flex items-center gap-3">
            {previewVideoMessage && !previewVideoMessage.deleted_for_everyone && (
              <>
                <button
                  onClick={() => {
                    startReply(previewVideoMessage);
                    setPreviewVideo("");
                    setPreviewVideoMessage(null);
                  }}
                  className="bg-zinc-800/80 hover:bg-zinc-700 rounded-xl p-3 transition"
                  title="Reply"
                >
                  <Reply size={22} />
                </button>
                <button
                  onClick={async () => {
                    await deleteForMe(previewVideoMessage.id);
                    setPreviewVideo("");
                    setPreviewVideoMessage(null);
                  }}
                  className="bg-zinc-800/80 hover:bg-zinc-700 rounded-xl p-3 transition text-red-400"
                  title="Delete for me"
                >
                  <Trash2 size={22} />
                </button>
              </>
            )}
            <button
              onClick={() => {
                setPreviewVideo("");
                setPreviewVideoMessage(null);
              }}
              className="bg-zinc-800/80 hover:bg-zinc-700 rounded-xl p-3 transition"
              title="Close"
            >
              <X size={22} />
            </button>
          </div>

          <video controls autoPlay className="
max-h-[82vh]
max-w-[96vw]
rounded-2xl
object-contain
shadow-2xl
ring-1
ring-white/10
sm:max-h-[88vh]

sm:max-h-[90vh]
sm:max-w-[90vw]
">
            <source src={previewVideo} type="video/mp4" />
          </video>

          <a
            href={previewVideo}
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