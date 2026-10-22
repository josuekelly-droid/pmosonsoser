"use client";

import { useState } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, Link as LinkIcon, X, Plus, Image as ImageIcon } from "lucide-react";

type Props = {
  images: string[];
  onChangeAction: (images: string[]) => void;
};

export function ImageUploader({ images, onChangeAction }: Props) {
  const [urlInput, setUrlInput] = useState("");

  // Ajout manuel par lien
  function addImageByUrl() {
    const url = urlInput.trim();
    if (!url || !/^https?:\/\//.test(url)) return;
    if (images.length >= 10) return;
    onChangeAction([...images, url]);
    setUrlInput("");
  }

  // Suppression d'une image
  function removeImage(index: number) {
    onChangeAction(images.filter((_, i) => i !== index)); 
  }

  return (
    <div className="space-y-4">
      {/* Zone d'actions : Lien + Upload Cloudinary */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        
        {/* 1. Ajout par lien */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageByUrl(); } }}
              placeholder="https://exemple.com/image.jpg"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-brand-red focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={addImageByUrl}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* 2. Upload Cloudinary */}
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary-params"
          onSuccess={(result: any) => {
            if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
              const url = result.info.secure_url as string;
              if (!images.includes(url) && images.length < 10) {
                onChangeAction([...images, url]);
              }
            }
          }}
          options={{
            multiple: true,
            maxFiles: 5,
            sources: ["local", "url", "camera"],
            styles: { palette: { window: "#1A1A1A", sourceBg: "#1A1A1A", windowBorder: "#E30613" } }
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-red/50 bg-brand-red/10 text-sm font-semibold text-brand-red transition hover:bg-brand-red/20"
            >
              <UploadCloud className="h-5 w-5" />
              Uploader depuis l'appareil
            </button>
          )}
        </CldUploadWidget>
      </div>

      {/* Aperçu des images */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-10 text-center">
          <ImageIcon className="h-10 w-10 text-neutral-600" />
          <p className="mt-2 text-xs text-neutral-500">Aucune image. Ajoutez un lien ou uploadez un fichier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.map((url, i) => (
            <div key={url + i} className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
              <Image
                src={url}
                alt={`Image ${i + 1}`}
                fill
                sizes="200px"
                className="object-cover"
                unoptimized
              />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                  Principale
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur-sm transition hover:bg-red-600 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}