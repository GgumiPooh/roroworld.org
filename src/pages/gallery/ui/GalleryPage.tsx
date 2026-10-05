"use client";

import { GalleryCard, useGalleries } from "@/entities/gallery";
import { useCurrentUser } from "@/entities/user";
import { useAuthOverlay } from "@/features/auth";
import { GalleryDetailOverlay } from "@/features/gallery-detail";
import { GalleryPostOverlay } from "@/features/gallery-post";
import { cn, type Nullable } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { SearchBar } from "@/widgets/search-bar";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";

export type GalleryPageProps = {
  className?: string;
};

const RECOMMENDED_TAGS = [
  "전체",
  "안경",
  "모자",
  "긴머리",
  "굿즈",
  "콘서트",
  "일상",
  "화보",
  "뮤비",
  "인스타",
];

export function GalleryPage({ className }: GalleryPageProps) {
  const [selectedTag, setSelectedTag] = useState("전체");
  const [isPostOverlayOpen, setIsPostOverlayOpen] = useState(false);
  const [selectedGalleryId, setSelectedGalleryId] = useState<Nullable<number>>(null);

  const { displayName } = useCurrentUser();
  const { open: openLogin } = useAuthOverlay();

  const { error, galleries, hasMore, isLoading, loadMore, refresh, search } = useGalleries();

  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  function handleSearch(query: string) {
    if (query.trim()) {
      search(query);
    } else {
      refresh();
    }
  }

  function handleTagClick(tag: string) {
    setSelectedTag(tag);
    if (tag === "전체") {
      refresh();
    } else {
      search(tag);
    }
  }

  function handleAddPost() {
    if (!displayName) {
      openLogin();
      return;
    }
    setIsPostOverlayOpen(true);
  }

  return (
    <div className={cn("relative scrollbar-hide h-dvh overflow-y-auto bg-black pt-50", className)}>
      <h1 className="mb-15 text-center text-5xl font-bold text-[#faf8e1] md:mb-30 md:text-8xl">
        Gallery
      </h1>

      <div className="z-2 mx-auto w-[min(90vw,760px)] overflow-x-hidden">
        <SearchBar className="mx-3 mb-6" onSearch={handleSearch} />

        <div className="mb-6 scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          {RECOMMENDED_TAGS.map((tag) => (
            <button
              key={tag}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
                selectedTag === tag
                  ? "bg-[#b9b9b978] text-[#e5e2e2]"
                  : "bg-gray-700/50 text-gray-400",
              )}
              type="button"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {isLoading && galleries.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-2 border-[#c4bda8] border-t-transparent" />
          </div>
        ) : error ? (
          <p className="text-center text-gray-400">{error}</p>
        ) : galleries.length === 0 ? (
          <p className="py-20 text-center text-gray-400">아직 게시물이 없습니다.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 pb-20 md:grid-cols-3">
              {galleries.map((gallery) => (
                <GalleryCard
                  key={gallery.id}
                  gallery={gallery}
                  onClick={() => setSelectedGalleryId(gallery.id)}
                />
              ))}
            </div>

            <div ref={observerRef} className="flex justify-center py-10">
              {isLoading && (
                <div className="size-6 animate-spin rounded-full border-2 border-[#c4bda8] border-t-transparent" />
              )}
              {!hasMore && galleries.length > 0 && (
                <p className="text-sm text-gray-500">모든 게시물을 불러왔습니다</p>
              )}
            </div>
          </>
        )}
      </div>

      <Button
        className="fixed right-10 bottom-10 z-50 flex rounded-full bg-[#dbd8c286] p-4 ring-3 ring-[#cfcfcf78]"
        size="lg"
        variant="ghost"
        aria-label="게시물 작성"
        onClick={handleAddPost}
      >
        <PlusIcon className="size-7 text-white" />
      </Button>

      {isPostOverlayOpen && (
        <GalleryPostOverlay
          isOpen={isPostOverlayOpen}
          onClose={() => setIsPostOverlayOpen(false)}
          onSuccess={refresh}
        />
      )}

      {selectedGalleryId !== null && (
        <GalleryDetailOverlay
          galleryId={selectedGalleryId}
          isOpen={selectedGalleryId !== null}
          onClose={() => {
            setSelectedGalleryId(null);
            refresh();
          }}
          onDeleted={() => {
            setSelectedGalleryId(null);
            refresh();
          }}
          onLoginRequested={openLogin}
        />
      )}
    </div>
  );
}
