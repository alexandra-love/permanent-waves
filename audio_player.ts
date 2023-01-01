

export class AudioPlayer {
	audio?: AsyncIterableIterator<Uint8Array>;
	playing = false;

	play() {
		if(this.playing) {
			return;
		}
		this.playing = true;
	}
}