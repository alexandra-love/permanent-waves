import { 
	Bot, 
	editOriginalInteractionResponse,
	Interaction,
	sendInteractionResponse,
	type ApplicationCommandOption,
	type CreateSlashApplicationCommand
} from "../deps.ts";

import { ensureVoiceConnection, formatCallbackData, waitingForResponse } from "../utils.ts";

function addedToQueueResponse(interaction: Interaction, title: string) {
	return formatCallbackData(`${interaction.user.username} added [**${title}**](${interaction.data.options[0].value}) to the queue.`, "Added to queue");
}

function alreadyPlayingResponse(bot: Bot, interaction: Interaction) {
	const player = bot.helpers.getPlayer(interaction.guildId);
	return formatCallbackData(`The bot is already playing.
		 Currently playing: **${player.nowPlaying.title}**, added by ${player.nowPlaying.added_by}`);
}

const badUrlResponse = formatCallbackData(`Bad URL, please enter a URL that starts with https://youtube.com or https://youtu.be.`);

const emptyQueueResponse = formatCallbackData(`There's nothing in the queue to play right now.`);

function nowPlayingResponse(bot: Bot, interaction: Interaction) {
	const player = bot.helpers.getPlayer(interaction.guildId);
	return formatCallbackData(`The bot has started playing again. 
			Currently playing: **${player.nowPlaying.title}**, added by ${player.nowPlaying.added_by}`);
}

export const playCommand = <CreateSlashApplicationCommand>{
	name: "play",
	description: "Adds a song or playlist to the queue and starts the music if it's not already playing",
	dmPermission: false,
	options: [
		<ApplicationCommandOption>{
			type: 3, // string
			name: "url",
			description: "The URL or video ID of the song or playlist to play",
			required: false
		}
	]
};


// todo it crashes when a timestamp is offered
export async function play(bot: Bot, interaction: Interaction, _args?) {
	if (!interaction.guildId) return;
	await ensureVoiceConnection(bot, interaction.guildId);
	const player = bot.helpers.getPlayer(interaction.guildId);
	await sendInteractionResponse(bot, interaction.id, interaction.token, waitingForResponse);

	let parsed_url;
	if(interaction!.data!.options) {
		try {
			parsed_url = new URL(interaction!.data!.options[0].value);
		} catch {
			await editOriginalInteractionResponse(bot, interaction.token, badUrlResponse);
		}
		
		let href;
		// remove the timestamp from the query
		if(parsed_url.href.indexOf("?t=") !== -1) {
			href = parsed_url.href.substring(0, parsed_url.href.indexOf("?"))
		} else {
			href = parsed_url.href;
		}

		const result = await player.pushQuery(interaction.guildId, interaction.user.username, href);
		if(result && result[0] && parsed_url.href.indexOf("youtube.com") !== -1 || parsed_url.href.indexOf("youtu.be") !== -1 && result[0].title) {
			await editOriginalInteractionResponse(bot, interaction.token, addedToQueueResponse(interaction, result[0].title));
		}
	} else {
		// restart the player if there's no url
		if(player.waiting || !player.playing) {
			if(player.nowPlaying) {
				await player.play();
				await editOriginalInteractionResponse(bot, interaction.token, nowPlayingResponse(bot, interaction));
			} else {
				await editOriginalInteractionResponse(bot, interaction.token, emptyQueueResponse);
			}
		} else {
			await editOriginalInteractionResponse(bot, interaction.token, alreadyPlayingResponse(bot, interaction));
		}
	}
}
