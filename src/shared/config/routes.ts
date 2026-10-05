export const HOME_ROUTE = "/";
export const ACTIVITY_ROUTE = "/activity";
export const ALBUMS_ROUTE = "/albums";
export const GALLERY_ROUTE = "/gallery";
export const TO_ARTIST_ROUTE = "/toArtist";
export const LOGIN_ROUTE = "/login";
export const SIGNUP_COMPLETE_ROUTE = "/signup-complete";

export function toAlbumDetailRoute(albumId: string | number): string {
  return `/album/${albumId}`;
}

export function toSongDetailRoute(albumId: string | number, trackNumber: string | number): string {
  return `/album/${albumId}/song/${trackNumber}`;
}
