"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
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
  Search,
  Reply,
  Pencil,
  Copy,
  Trash2,
  MoreVertical,
  Check,
  Clock3,
  Maximize2,
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

  // Emoji picker (for composing a message)
  const [showEmoji, setShowEmoji] = useState(false);

  // Per-message "..." menu (reply / edit / copy / delete / react)
  const [menuFor, setMenuFor] = useState<string | null>(null);

  // Reply
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  // Edit
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Refs
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [disappearAfter, setDisappearAfter] = useState<number | null>(null);

  // ==========================
  // Auto Scroll
  // ==========================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        { event: "*", schema: "public", table: "messages" },
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
      .select("partner_id")
      .eq("id", user.id)
      .single();

    if (error || !profile?.partner_id) {
      alert("No partner connected.");
      return;
    }

    setPartnerId(profile.partner_id);

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

  function scrollToMessage(id: string) {
    const el = messageRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-pink-400");
    setTimeout(() => el.classList.remove("ring-2", "ring-pink-400"), 1200);
  }

  // ==========================
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
    <main className="h-[100dvh] bg-zinc-950 text-white flex flex-col overflow-hidden overscroll-none">
      {/* Header */}
<header className="shrink-0 border-b border-zinc-800 
px-3 py-3 sm:px-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-pink-500 truncate">
  ❤️ {partnerName || "Private Chat"}
</h1>

          <p className="text-[11px] sm:text-sm text-zinc-400 truncate">
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
        </div>

        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          className="h-11 w-11 shrink-0 rounded-xl bg-zinc-800 flex items-center justify-center 
          hover:bg-zinc-700 transition" title="Search messages">
          <Search size={20} />
        </button>
      </header>

      {searchOpen && (
        <div className="border-b border-zinc-800 p-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full rounded-xl bg-zinc-900 p-3 outline-none text-sm"
            autoFocus
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-3 sm:p-4 min-h-0 scrollbar-hide overscroll-contain pb-24">
        {displayedMessages.length === 0 ? (
          <div className="text-center text-zinc-500 mt-20">
            {searchQuery.trim() ? "No messages found" : "No messages yet ❤️"}
          </div>
        ) : (
          displayedMessages.map((msg) => {
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
              <div
                key={msg.id}
                ref={(el) => {
                  messageRefs.current[msg.id] = el;
                }}
                className={`mb-4 flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isDeleted) setMenuFor(msg.id);
                  }}
                  className={`relative w-fit max-w-[90%] sm:max-w-[80%] lg:max-w-[75%] rounded-2xl 
                    px-3 sm:px-4 py-2 sm:py-3 transition break-words ${
                    isMine ? "bg-pink-600" : "bg-zinc-800"
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
                      className="absolute -top-2 -right-2 bg-zinc-900 border border-zinc-700 rounded-full p-1 opacity-70 hover:opacity-100 transition"
                    >
                      <MoreVertical size={14} />
                    </button>
                  )}

                  {/* Per-message menu */}
                  {menuFor === msg.id && !isDeleted && (
  <div
    onClick={(e) => e.stopPropagation()}
    className="absolute z-50 top-6 right-0 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden w-44 text-sm"
  >
    {/* Quick Reactions */}
    <div className="flex justify-around p-2 border-b border-zinc-700">
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            reactToMessage(msg.id, emoji);
            setMenuFor(null);
          }}
          className="hover:scale-125 transition text-lg"
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
      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 transition"
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
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 transition"
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
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 transition"
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
      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 transition text-red-400"
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
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 transition text-red-400"
      >
        <Trash2 size={16} />
        Delete for everyone
      </button>
    )}
  </div>
)}

                  {/* Reply preview quoted inside bubble */}
                  {repliedMessage && !isDeleted && (
                    <button
                      onClick={() => scrollToMessage(repliedMessage.id)}
                      className="block w-full text-left mb-2 px-2 py-1 rounded-lg bg-black/20 border-l-2 border-pink-300 text-xs text-zinc-200 truncate"
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
    className="rounded-xl mb-2 w-full max-w-xs sm:max-w-sm md:max-w-md 
    lg:max-w-lg h-auto cursor-pointer object-cover hover:opacity-90 transition select-none"
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
      className="rounded-xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg select-none"
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
  <audio controls className="w-full max-w-xs sm:max-w-sm mb-2">
    <source
      src={msg.audio_url}
      type="audio/webm"
    />
  </audio>
)}

{msg.message && (
  <p className="break-all text-sm sm:text-base leading-6">
    {msg.message}
  </p>
)}
                    </>
                  )}

                <div className="flex flex-wrap justify-end items-center gap-1 sm:gap-2 mt-2 text-[10px] sm:text-xs opacity-70">

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
                    <div className="mt-1 text-lg">{msg.reaction}</div>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* Reply / Edit preview bar above input */}
      {(replyTo || editingMessage) && (
        <div className="border-t border-zinc-800 px-4 pt-3 flex items-start justify-between gap-3 bg-zinc-900">
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
   <div className="
shrink-0
border-t border-zinc-800
bg-zinc-950/95
backdrop-blur-md
px-2 py-2
sm:px-3 sm:py-3
flex items-center gap-2
overflow-x-auto
scrollbar-hide
pb-[max(env(safe-area-inset-bottom),8px)]
">
  
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
    onFocus={()=>{
setTimeout(()=>{
bottomRef.current?.scrollIntoView({
behavior:"smooth"
})
},200)
}}
/>

        {!editingMessage && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-zinc-800 hover:bg-zinc-700
             transition disabled:opacity-50 flex items-center justify-center"
          >
            <ImagePlus size={22} />
          </button>
        )}
   <label className="hidden md:flex items-center gap-2 text-xs whitespace-nowrap shrink-0">
<input
type="checkbox"
checked={viewOnce}
onChange={(e)=>setViewOnce(e.target.checked)}
/>

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
           className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-zinc-800 hover:bg-zinc-700 
           transition flex items-center justify-center"
          >
            <Smile size={22} />
          </button>

          {showEmoji && (
            <div className="absolute bottom-full mb-2 right-0 sm:left-0 sm:right-auto z-50 
            scale-90 sm:scale-100 origin-bottom-right">
              <EmojiPicker
lazyLoadEmojis
searchDisabled
skinTonesDisabled
previewConfig={{
showPreview:false
}}
height={320}
width={280}
theme={"dark" as any}
onEmojiClick={addEmoji}
 />
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
    className="hidden sm:block rounded-xl bg-zinc-800 px-2 py-3 text-xs outline-none shrink-0"
  >
    <option value="">♾️ Off</option>
    <option value="3600">🕐 1 Hour</option>
    <option value="86400">📅 24 Hours</option>
    <option value="604800">🗓️ 7 Days</option>
  </select>
</div>

        {!editingMessage &&
          (recording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-red-600 
              hover:bg-red-700 transition flex items-center justify-center"
            >
              <Square size={22} />
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-green-600 hover:bg-green-700 
              transition flex items-center justify-center"
            >
              <Mic size={22} />
            </button>
          ))}

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
         className="flex-1 min-w-0 rounded-xl bg-zinc-900 px-3 py-3 text-sm sm:text-base outline-none"
        />

        <button
          type="button"
          disabled={uploading}
          onClick={editingMessage ? saveEditedMessage : sendMessage}
        className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-pink-600 hover:bg-pink-700 
        transition disabled:opacity-50 flex items-center justify-center"
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
            className="max-h-[85vh] max-w-[96vw] sm:max-h-[90vh] sm:max-w-[90vw] object-contain rounded-xl"
          />

          <a
            href={previewImage}
            download
           className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-pink-600 hover:bg-pink-700 transition px-4 py-2 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 text-sm sm:text-base"
          >
            <Download size={20} />
            Download
          </a>
        </div>
      )}

      {/* Video Preview */}
      {previewVideo && (
         <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3">
    <div className="absolute top-4 right-4 flex items-center gap-2 sm:gap-3">
            {previewVideoMessage &&
        !previewVideoMessage.deleted_for_everyone && (
          <>
            <button
              onClick={() => {
                startReply(previewVideoMessage);
                setPreviewVideo("");
                setPreviewVideoMessage(null);
              }}
              className="bg-zinc-800/80 hover:bg-zinc-700 rounded-xl p-2 sm:p-3 transition"
              title="Reply"
            >
              <Reply size={20} />
            </button>
                 <button
              onClick={async () => {
                await deleteForMe(previewVideoMessage.id);
                setPreviewVideo("");
                setPreviewVideoMessage(null);
              }}
              className="bg-zinc-800/80 hover:bg-zinc-700 rounded-xl p-2 sm:p-3 transition text-red-400"
              title="Delete for me"
            >
              <Trash2 size={20} />
            </button>
          </>
        )}
            <button
        onClick={() => {
          setPreviewVideo("");
          setPreviewVideoMessage(null);
        }}
        className="bg-zinc-800/80 hover:bg-zinc-700 rounded-xl p-2 sm:p-3 transition"
        title="Close"
      >
        <X size={20} />
      </button>
          </div>

         <video
      controls
      autoPlay
      className="max-h-[85vh] max-w-[96vw] sm:max-h-[90vh] sm:max-w-[90vw] object-contain rounded-xl"
    >
      <source src={previewVideo} type="video/mp4" />
    </video>


          <a
      href={previewVideo}
      download
      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-pink-600 hover:bg-pink-700 transition px-4 py-2 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 text-sm sm:text-base"
    >
      <Download size={18} />
      Download
    </a>
        </div>
      )}
    </main>
  );
}