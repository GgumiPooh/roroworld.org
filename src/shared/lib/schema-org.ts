import { type Optional } from "./nullish";

export type BreadcrumbLink = {
  item: string;
  name: string;
};

export type AlbumTrackItem = {
  name: string;
  trackNumber?: number;
  url?: string;
};

export function createWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    alternateName: ["로로월드", "한로로 팬사이트"],
    description: "싱어송라이터 한로로(HANRORO) 팬사이트 로로월드",
    inLanguage: "ko-KR",
    name: "RORO WORLD",
    url: "https://roroworld.org",
  };
}

export function createArtistSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    alternateName: "HANRORO",
    description: "대한민국의 싱어송라이터 한로로(HANRORO)",
    genre: ["K-Indie", "Rock", "Modern Rock", "Indie Pop"],
    image: "https://roroworld.org/images/og-thumbnail.png",
    name: "한로로",
    sameAs: [
      "https://www.hanroro.com",
      "https://www.instagram.com/hanr0r0/",
      "https://www.youtube.com/@hanroro6055",
      "https://m.blog.naver.com/PostList.naver?blogId=hanr0r0&tab=1",
    ],
    url: "https://roroworld.org",
  };
}

export function createBreadcrumbSchema(items: BreadcrumbLink[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((breadcrumb, index) => ({
      "@type": "ListItem",
      item: breadcrumb.item.startsWith("http")
        ? breadcrumb.item
        : `https://roroworld.org${breadcrumb.item.startsWith("/") ? "" : "/"}${breadcrumb.item}`,
      name: breadcrumb.name,
      position: index + 1,
    })),
  };
}

export function createCollectionPageSchema(name: string, description: string, path: string) {
  const url = path.startsWith("http") ? path : `https://roroworld.org${path}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    description,
    isPartOf: {
      "@type": "WebSite",
      name: "RORO WORLD",
      url: "https://roroworld.org",
    },
    name,
    url,
  };
}

export type MusicAlbumSchemaInput = {
  datePublished?: Optional<string>;
  description?: Optional<string>;
  image?: Optional<string>;
  name: string;
  tracks?: Optional<AlbumTrackItem[]>;
  url: string;
};

export function createMusicAlbumSchema(params: MusicAlbumSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    byArtist: {
      "@type": "MusicGroup",
      name: "한로로",
      url: "https://roroworld.org",
    },
    datePublished: params.datePublished || undefined,
    description: params.description || undefined,
    image: params.image || undefined,
    name: params.name,
    numTracks: params.tracks?.length,
    track: params.tracks?.map((trackItem) => ({
      "@type": "MusicRecording",
      name: trackItem.name,
      position: trackItem.trackNumber,
      url: trackItem.url,
    })),
    url: params.url,
  };
}

export type MusicRecordingSchemaInput = {
  albumName?: Optional<string>;
  albumUrl?: Optional<string>;
  description?: Optional<string>;
  image?: Optional<string>;
  lyrics?: Optional<string>;
  name: string;
  trackNumber?: Optional<number>;
  url: string;
};

export function createMusicRecordingSchema(params: MusicRecordingSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    byArtist: {
      "@type": "MusicGroup",
      name: "한로로",
      url: "https://roroworld.org",
    },
    description: params.description || undefined,
    image: params.image || undefined,
    inAlbum: params.albumName
      ? {
          "@type": "MusicAlbum",
          name: params.albumName,
          url: params.albumUrl || undefined,
        }
      : undefined,
    name: params.name,
    position: params.trackNumber || undefined,
    recordingOf: params.lyrics
      ? {
          "@type": "MusicComposition",
          lyrics: {
            "@type": "CreativeWork",
            text: params.lyrics,
          },
        }
      : undefined,
    url: params.url,
  };
}

export function createWebPageSchema(name: string, description: string, path: string) {
  const url = path.startsWith("http") ? path : `https://roroworld.org${path}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    description,
    isPartOf: {
      "@type": "WebSite",
      name: "RORO WORLD",
      url: "https://roroworld.org",
    },
    name,
    url,
  };
}
