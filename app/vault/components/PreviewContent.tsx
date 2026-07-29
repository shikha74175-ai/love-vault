"use client";

import Image from "next/image";
import { FileText, Music } from "lucide-react";

type Props = {
  fileType: string;
  url: string;
  fileName: string;
};

export default function PreviewContent({
  fileType,
  url,
  fileName,
}: Props) {
  return (
    <div className="flex justify-center items-center p-6">

      <div className="w-full max-w-6xl rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">

        {/* IMAGE */}

        {fileType === "image" && (
          <div className="relative w-full h-[75vh]">
            <Image
              src={url}
              alt={fileName}
              fill
              unoptimized
              className="object-contain bg-black"
            />
          </div>
        )}

        {/* VIDEO */}

        {fileType === "video" && (
          <video
            src={url}
            controls
            className="w-full max-h-[75vh] bg-black"
          />
        )}

        {/* AUDIO */}

        {fileType === "audio" && (
          <div className="flex flex-col items-center justify-center py-24 gap-6">

            <Music
              size={80}
              className="text-pink-500"
            />

            <h2 className="text-xl font-semibold">
              {fileName}
            </h2>

            <audio
              controls
              src={url}
              className="w-[90%] max-w-lg"
            />

          </div>
        )}

        {/* PDF */}

        {fileType === "document" && (
          <iframe
            src={url}
            className="w-full h-[75vh] bg-white"
          />
        )}

        {/* Unknown */}

        {![
          "image",
          "video",
          "audio",
          "document",
        ].includes(fileType) && (
          <div className="py-24 flex flex-col items-center gap-5">

            <FileText
              size={80}
              className="text-zinc-500"
            />

            <h2 className="text-xl">
              Preview not available
            </h2>

          </div>
        )}

      </div>

    </div>
  );
}