import { cn, findMetadataUrl, type Nullable } from "@/shared/lib";
import { ImageWithPlaceholder } from "@/shared/ui";
import Link from "next/link";
import { type AlbumView } from "../model/types";

export type AlbumCardProps = {
  className?: string;
  album: AlbumView;
};

export function AlbumCard({ className, album }: AlbumCardProps) {
  const coverUrl: Nullable<string> = findMetadataUrl(album.metadata, "img") || album.coverUrl;
  const albumTitle = album.titleText || "Untitled Album";
  const publishedDate = album.publishedAt ?? "";

  const isDigitalSingle = album.albumType === "DIGITAL_SINGLE";
  const targetPath = `/album/${album.id}` + (isDigitalSingle ? "/song/1" : "");

  return (
    <li className={cn("mb-20 rounded-xl bg-gray-900/40 backdrop-blur-md md:mb-50", className)}>
      <Link className="flex p-0" href={targetPath}>
        <div className="flex flex-row items-center gap-5 sm:gap-10 md:gap-15">
          <ImageWithPlaceholder
            className="relative h-25 w-25 items-center gap-5 sm:h-50 sm:w-50 sm:gap-15 lg:h-60 lg:w-60"
            imgClassName="absolute size-full shrink-0 bg-plum-800/60 object-cover object-center"
            alt={albumTitle}
            src={coverUrl}
          />
          <div className="min-w-0 text-left">
            <h2 className="font-medium text-plum-100 sm:text-2xl md:text-3xl">{albumTitle}</h2>
            {publishedDate && (
              <p className="mt-2 text-sm text-plum-300/70 md:text-lg">
                {publishedDate.replaceAll("-", ".")}
              </p>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
