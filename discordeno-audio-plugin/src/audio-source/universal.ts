import { getYoutubeSources } from "./youtube.ts";

export type LoadSource = typeof loadLocalOrYoutube;

export function loadLocalOrYoutube(query: string, guildId: bigint, added_by?: string) {
  return getYoutubeSources(guildId, String(added_by), query);
}
