import { getYoutubeSources } from "./youtube.ts";

export type LoadSource = typeof loadLocalOrYoutube;

export function loadLocalOrYoutube(query: string, added_by?: string) {
  return getYoutubeSources(query, String(added_by));
}
