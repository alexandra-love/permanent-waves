import { YouTube, ytDownload } from "../../deps.ts";
import { bufferIter } from "../../utils/mod.ts";
import { demux } from "../demux/mod.ts";
import { createAudioSource, empty } from "./audio-source.ts";

import { errorMessageCallback, parseYoutubeId } from "../../../utils.ts";

export async function getYoutubeSources(guildId: bigint, added_by?: string, ...queries: string[]) {
  const sources = queries.map((query) => getYoutubeSource(query, guildId, added_by));
  const awaitedSources = await Promise.all(sources);
  return awaitedSources
    .filter((source) => source !== undefined)
    .map((source) => source!);
}

export async function getYoutubeSource(query: string, guildId: bigint, added_by?: string) {
  try {
    query = parseYoutubeId(query);
    const results = await YouTube.search(query, { limit: 1, type: "video" });
    if (results.length > 0) {
      const { id, title } = results[0];
      return createAudioSource(title!, async () => {
        try {
          const stream = await ytDownload(query, {
            mimeType: `audio/webm; codecs="opus"`,
          });
          return bufferIter(demux(stream));
        } catch {
          errorMessageCallback(guildId, `There was an error trying to play **${title}**:\n
            something broke in getYoutubeSource`);
          console.log(`Failed to play ${title}\n Returning empty stream`);
          return empty();
        }
      }, guildId, added_by);
    }
  } catch(err) {
    console.error(err);
    return undefined;
  }
}
