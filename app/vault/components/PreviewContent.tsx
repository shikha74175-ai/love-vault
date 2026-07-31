"use client";

import Image from "next/image";
import { FileText, Music } from "lucide-react";
import {
  TransformWrapper,
  TransformComponent,
} from "react-zoom-pan-pinch";

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
  <div className="w-full h-[calc(100vh-170px)] bg-black flex items-center justify-center overflow-hidden">

    <TransformWrapper
      initialScale={1}
      minScale={1}
      maxScale={5}
      doubleClick={{ mode: "zoomIn" }}
      wheel={{ step: 0.15 }}
      pinch={{ step: 5 }}
      centerOnInit
    >
      <TransformComponent
        wrapperClass="!w-full !h-full"
        contentClass="!w-full !h-full flex items-center justify-center"
      >
        <Image
          src={url}
          alt={fileName}
          width={2500}
          height={2500}
          unoptimized
          priority
          draggable={false}
          className="
            max-w-full
            max-h-full
            object-contain
            select-none
          "
        />
      </TransformComponent>
    </TransformWrapper>

  </div>
)}

        {/* VIDEO */}

        {fileType === "video" && (
          <video
            src={url}
            controls
            className="w-full h-[calc(100vh-170px)] bg-black object-contain"
          />
        )}

        {/* AUDIO */}

        {fileType === "audio" && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-170px)] gap-6">

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
            className="w-full h-[calc(100vh-170px)] bg-white"
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