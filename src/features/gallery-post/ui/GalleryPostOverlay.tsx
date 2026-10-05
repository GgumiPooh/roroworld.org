"use client";

import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { ArrowUpTrayIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { type ChangeEvent, useRef, useState } from "react";
import { useEvent } from "react-use";

// INFO: Fast client-side image compression using HTML5 canvas.
function compressImage(file: File, maxSize = 1920, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    if (file.size < 500 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { height, width } = img;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              lastModified: Date.now(),
              type: "image/jpeg",
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

type FileItem = {
  compressedFile: File | null;
  isCompressing: boolean;
  originalFile: File;
  preview: string;
};

export type GalleryPostOverlayProps = {
  className?: string;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function GalleryPostOverlay({
  className,
  isOpen = true,
  onClose,
  onSuccess,
}: GalleryPostOverlayProps) {
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEvent("keydown", (e: KeyboardEvent) => {
    if (e.isComposing) {
      return;
    }
    if (e.key === "Escape") {
      onClose();
    }
  });

  if (!isOpen) {
    return null;
  }

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) {
      return;
    }

    const newItems: FileItem[] = Array.from(selectedFiles).map((file) => ({
      compressedFile: null,
      isCompressing: true,
      originalFile: file,
      preview: URL.createObjectURL(file),
    }));

    const startIndex = files.length;
    setFiles((prev) => [...prev, ...newItems]);

    newItems.forEach(async (item, i) => {
      const index = startIndex + i;
      const compressed = await compressImage(item.originalFile);
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === index ? { ...f, compressedFile: compressed, isCompressing: false } : f,
        ),
      );
    });
  };

  const handleRemoveImage = (index: number) => {
    setFiles((prev) => {
      const removed = prev[index];
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const isAnyCompressing = files.some((f) => f.isCompressing);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (files.length === 0) {
      alert("사진을 최소 1장 이상 추가해주세요.");
      return;
    }
    if (isAnyCompressing) {
      alert("이미지 압축 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadPromises = files.map(async ({ compressedFile, originalFile }) => {
        const file = compressedFile || originalFile;

        const prepareRes = await fetch("/api/uploads/prepare", {
          body: JSON.stringify({
            filename: originalFile.name,
            mimeType: file.type,
          }),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (!prepareRes.ok) {
          throw new Error("presigned URL 발급 실패");
        }
        const { objectKey, presignedUrl } = await prepareRes.json();

        const uploadRes = await fetch(presignedUrl, {
          body: file,
          headers: { "Content-Type": file.type },
          method: "PUT",
        });

        if (!uploadRes.ok) {
          throw new Error("R2 업로드 실패");
        }

        const confirmRes = await fetch("/api/uploads/confirm", {
          body: JSON.stringify({ objectKey }),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (!confirmRes.ok) {
          throw new Error("업로드 확인 실패");
        }
        const { url } = await confirmRes.json();
        return url as string;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      const res = await fetch("/api/public/gallery", {
        body: JSON.stringify({
          description: null,
          imageUrls: uploadedUrls,
          title: title.trim(),
        }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "게시물 등록에 실패했습니다.");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to create gallery:", err);
      alert(err instanceof Error ? err.message : "게시물 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-60 flex items-center justify-center backdrop-blur-lg",
        className,
      )}
    >
      <div className="relative max-h-[90vh] scrollbar-pretty w-[min(95vw,600px)] overflow-y-auto rounded-3xl border border-gray-500/60 bg-black p-6">
        <Button className="absolute top-4 right-4" size="sm" variant="icon" onClick={onClose}>
          <XMarkIcon className="size-6 text-gray-400" />
        </Button>

        <h2 className="mb-6 text-2xl font-bold text-plum-100">새 게시물</h2>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-plum-300">
            사진 ({files.length}장)
            {isAnyCompressing && <span className="text-yellow-400 ml-2">압축 중...</span>}
          </label>

          <div className="mb-4 grid grid-cols-3 gap-3">
            {files.map(({ isCompressing, preview }, index) => (
              <div key={index} className="group relative aspect-3/4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="size-full rounded-xl object-cover"
                  alt={`미리보기 ${index + 1}`}
                  src={preview}
                />
                {isCompressing && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                    <div className="size-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
                <button
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                >
                  <XMarkIcon className="size-4" />
                </button>
              </div>
            ))}

            <button
              className="flex aspect-3/4 items-center justify-center rounded-xl border-2 border-dashed border-gray-600 text-gray-500 transition-colors hover:border-plum-400 hover:text-plum-400"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <PhotoIcon className="size-10" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            type="file"
            onChange={handleImageSelect}
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-[#faf8e1]">제목</label>
          <input
            className="w-full rounded-xl border border-gray-600 bg-gray-700/50 px-4 py-3 text-plum-100 placeholder-gray-500 transition-colors outline-none focus:border-plum-400"
            placeholder="제목을 입력하세요..."
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex">
          <Button
            className="flex-1 rounded-xl py-3 text-[#fffac3] disabled:opacity-50"
            disabled={isSubmitting || isAnyCompressing}
            size="md"
            variant="icon"
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <ArrowUpTrayIcon className="size-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
