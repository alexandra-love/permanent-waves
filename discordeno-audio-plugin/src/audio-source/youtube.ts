import { YouTube, ytdl } from "../../deps.ts";
import { bufferIter } from "../../utils/mod.ts";
import { demux } from "../demux/mod.ts";
import { createAudioSource, empty } from "./audio-source.ts";

function supportedFormatFilter(format: {
  codecs: string;
  container: string;
  audioSampleRate?: string;
}) {
  return (
    format.codecs === "opus" &&
    format.container === "webm" &&
    format.audioSampleRate === "48000"
  );
}

export async function getYoutubeSources(added_by?: string, ...queries: string[]) {
  const sources = queries.map((query) => getYoutubeSource(query, added_by));
  const awaitedSources = await Promise.all(sources);
  return awaitedSources
    .filter((source) => source !== undefined)
    .map((source) => source!);
}

export async function getYoutubeSource(query: string, added_by?: string) {
  try {
    const results = await YouTube.search(query, { limit: 1, type: "video" });
    if (results.length > 0) {
      const { id, title } = results[0];
      return createAudioSource(title!, async () => {
        try {
          const stream = await ytdl(id!, {
            filter: supportedFormatFilter
          });
          return bufferIter(demux(stream));
        } catch {
          console.log(`Failed to play ${title}\n Returning empty stream`);
          return empty();
        }
      }, added_by);
    }
  } catch(err) {
    console.error(err);
    return undefined;
  }
}
