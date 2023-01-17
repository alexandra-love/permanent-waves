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
		if(parsed_url.href.indexOf("?t=") !== -1) {
			href = parsed_url.href.substring(0, parsed_url.href.indexOf("?"))
		} else {
			href = parsed_url.href;
		}

		const result = await player.pushQuery(interaction.user.username, href);
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

/*import { exists } from "https://deno.land/std@0.161.0/fs/mod.ts";

import { configs } from "../configs.ts";
import { Bot } from "../deps.ts";
import { download, ensureVoiceConnection } from "../utils.ts";
import { type Command } from "../types.ts";

export async function play(bot: Bot, command: Command) {
	await ensureVoiceConnection(bot, command.guildId);
	const player = bot.helpers.getPlayer(command.guildId);
	await player.pushQuery(command.params);
	await player.play();
}*/

/*const parsed_url = new URL(url);
let video_id = "";

if(parsed_url.href.indexOf("youtube.com") !== -1) {
	video_id = parsed_url.search.substring(3);
} else if(parsed_url.href.indexOf("youtu.be") === -1)  {
	video_id = parsed_url.pathname.substring(1);
} else {
	return {
		status: false,
		message: "This URL is invalid"
	};
}

if (!(await exists(`${configs.project_root}/music/`))) {
	await download(video_id);
}*/


// single video
/*
URL {
  href: "https://www.youtube.com/watch?v=DhobsmmyGFs",
  origin: "https://www.youtube.com",
  protocol: "https:",
  username: "",
  password: "",
  host: "www.youtube.com",
  hostname: "www.youtube.com",
  port: "",
  pathname: "/watch",
  hash: "",
  search: "?v=DhobsmmyGFs"
}
{
  endpoint: "stockholm3048.discord.media:443",
  sessionId: "74d4d31a8f5c507f9852278867d42c05",
  token: "08b9f3bc65a233d5"
}*/

// playlist
/*URL {
  href: "https://www.youtube.com/playlist?list=PLvNazUnle2rTZO7OVYhhRdzFb9W4xSpNk",
  origin: "https://www.youtube.com",
  protocol: "https:",
  username: "",
  password: "",
  host: "www.youtube.com",
  hostname: "www.youtube.com",
  port: "",
  pathname: "/playlist",
  hash: "",
  search: "?list=PLvNazUnle2rTZO7OVYhhRdzFb9W4xSpNk"
}*/