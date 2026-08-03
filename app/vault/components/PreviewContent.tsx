"use client";

import Image from "next/image";
import {
  FileText,
  Music,
} from "lucide-react";

import {
  TransformWrapper,
  TransformComponent,
} from "react-zoom-pan-pinch";

type Props = {
  fileType:
    | "image"
    | "video"
    | "audio"
    | "document";

  url: string;

  fileName: string;
};

const PREVIEW_HEIGHT =
  "h-[calc(100vh-170px)]";

export default function PreviewContent({

  fileType,

  url,

  fileName,

}: Props) {

  return (

    <div className="flex justify-center p-4 sm:p-6">

      <div
        className="
          w-full
          max-w-7xl
          overflow-hidden
          rounded-3xl
          border
          border-zinc-800
          bg-zinc-900
          shadow-2xl
        "
      >

        {/* IMAGE */}

        {fileType === "image" && (

          <div
            className={`flex ${PREVIEW_HEIGHT} items-center justify-center bg-black`}
          >

            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={6}
              centerOnInit
              doubleClick={{
                mode: "zoomIn",
              }}
              wheel={{
                step: 0.15,
              }}
              pinch={{
                step: 5,
              }}
            >

              <TransformComponent
                wrapperClass="!h-full !w-full"
                contentClass="
                  !h-full
                  !w-full
                  flex
                  items-center
                  justify-center
                "
              >

                <Image
                  src={url}
                  alt={fileName}
                  width={3000}
                  height={3000}
                  priority
                  unoptimized
                  draggable={false}
                  className="
                    max-h-full
                    max-w-full
                    select-none
                    object-contain
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
            controlsList="nodownload"
            playsInline
            preload="metadata"
            className={`
              w-full
              ${PREVIEW_HEIGHT}
              bg-black
              object-contain
            `}
          />

        )}

        {/* AUDIO */}

        {fileType === "audio" && (

          <div
            className={`
              flex
              ${PREVIEW_HEIGHT}
              flex-col
              items-center
              justify-center
              gap-8
              px-6
            `}
          >

            <div
              className="
                rounded-full
                bg-pink-600/20
                p-8
              "
            >

              <Music
                size={80}
                className="text-pink-500"
              />

            </div>

            <h2
              className="
                max-w-lg
                text-center
                text-xl
                font-semibold
              "
            >

              {fileName}

            </h2>

            <audio
              controls
              preload="metadata"
              src={url}
              className="
                w-full
                max-w-xl
              "
            />

          </div>

        )}

        {/* DOCUMENT */}

        {fileType === "document" && (

          <iframe
            src={url}
            title={fileName}
            className={`
              w-full
              ${PREVIEW_HEIGHT}
              bg-zinc-950 text-white
            `}
          />

        )}

        {/* UNKNOWN */}

        {![
          "image",
          "video",
          "audio",
          "document",
        ].includes(fileType) && (

          <div
            className={`
              flex
              ${PREVIEW_HEIGHT}
              flex-col
              items-center
              justify-center
              gap-6
            `}
          >

            <FileText
              size={80}
              className="text-zinc-500"
            />

            <div className="text-center">

              <h2 className="text-2xl font-semibold">

                Preview not available

              </h2>

              <p className="mt-2 text-zinc-400">

                This file type can't be previewed.

              </p>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}