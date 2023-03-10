let lastId = -1n;

export type AudioSource = {
  id: bigint;
  title: string;
  data: () =>
    | Promise<AsyncIterableIterator<Uint8Array>>
    | AsyncIterableIterator<Uint8Array>;
  guildId: bigint;
  added_by?: string;
};

export async function* empty() {}

export function createAudioSource(
  title: string,
  data: () =>
    | Promise<AsyncIterableIterator<Uint8Array>>
    | AsyncIterableIterator<Uint8Array>,
  guildId: bigint,
  added_by?: string
): AudioSource {
  lastId++;
  return {
    id: lastId,
    title,
    data: () => {
      try {
        return data();
      } catch (error) {
        console.error(error);
        console.log(`Failed to play ${title}\n Returning empty stream`);
        return empty();
      }
    },
    guildId,
    added_by
  };
}
