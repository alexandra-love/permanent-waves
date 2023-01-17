import { 
	Bot, 
	Interaction, 
	InteractionResponse, 
	sendInteractionResponse,
	sendMessage,
	type CreateMessage,
	type CreateSlashApplicationCommand,
	type Embed, 
	type InteractionCallbackData
} from "../deps.ts";

import { configs } from "../configs.ts"

import { bot } from "../main.ts";
import { getAllowedTextChannel } from "../utils.ts";
import { ConnectionData } from "../discordeno-audio-plugin/mod.ts";

export async function np(bot: Bot, interaction: Interaction) {
	await sendInteractionResponse(bot, interaction.id, interaction.token, nowPlayingResponse(bot, interaction));
}

function formatQueue(bot: Bot, interaction: Interaction) {
	const player = bot.helpers.getPlayer(interaction.guildId);
	let formattedText = "";

	if(!player.nowPlaying) {
		return "Nothing is currently in the queue.";
	} else {
		formattedText = `Now playing: **${player.nowPlaying.title}**, added by ${player.nowPlaying.added_by}`
	}

	formattedText = formattedText.concat(`\nUp next:`);

	for(let audioSource of player.upcoming()) {
		formattedText = formattedText.concat(`\n- **${audioSource.title}**, added by ${audioSource.added_by}`)
	}

	return formattedText;
}

function nowPlayingResponse(bot: Bot, interaction: Interaction) {
	return  <InteractionResponse>{
		type: 4,
		data: <InteractionCallbackData>
		{
			content: "",
			embeds: [<Embed>{
				title: "In the queue",
				color: configs.embed_color,
				description: formatQueue(bot, interaction)
			}]
		}
	}
}

function nowPlayingMessage(bot: Bot, guildId: number) {
	const player = bot.helpers.getPlayer(guildId);
	return <CreateMessage>{
		embeds: [<Embed>{
			color: configs.embed_color,
			description: `Now playing: **${player.nowPlaying.title}**, added by ${player.nowPlaying.added_by}`
		}]
	}
}

export async function nowPlayingCallback(connectionData: ConnectionData) {
	const channel = await getAllowedTextChannel(bot, connectionData.guildId);
	await sendMessage(bot, channel.id, nowPlayingMessage(bot, connectionData.guildId));
}

export const npCommand = <CreateSlashApplicationCommand>{
	name: "np",
	description: "Shows the currently-playing song along with the next five songs in the queue",
	dmPermission: false
};
