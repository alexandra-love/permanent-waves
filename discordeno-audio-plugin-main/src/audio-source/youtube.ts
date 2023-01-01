import { YouTube, getInfo, downloadFromInfo, VideoFormat, ytdl, ytDownload } from "../../deps.ts";
import { bufferIter } from "../../utils/mod.ts";
import { demux } from "../demux/mod.ts";
import { createAudioSource } from "./audio-source.ts";

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
  //const results = await YouTube.getVideo(query);
  try {
    const result = await ytdl(query, { filter: "audio" });
    const info = await getInfo(query!);
    if (result) {
      const title = info.player_response.videoDetails.title;
      return createAudioSource(title!, async () => {
        //const audio = await ytDownload(info.videoDetails.videoId.toString(), {
        //  mimeType: `audio/webm; codecs="opus"`,
        //});
        const audio = await downloadFromInfo(info, {
          filter: supportedFormatFilter,
        });
        return bufferIter(demux(audio));
      }, added_by);
    }
  } catch(err) {
    console.error(err);
    return undefined;
  }
}
