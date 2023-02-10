import { Bot } from "https://deno.land/x/discordeno@18.0.1/bot.ts";
import { configs } from "./configs.ts";
import { 
	getChannel, 
	getChannels, 
	getGuild, 
	sendMessage, 
	type BigString, 
	type CreateMessage, 
	type Embed, 
	type InteractionCallbackData, 
	type InteractionResponse 
} from "./deps.ts";
import { bot } from "./main.ts";

import { ConnectionData } from "./discordeno-audio-plugin/mod.ts";

export function channelIsAllowed(guild: string, channel: string) {
	if(`${guild}:${channel}` in configs.allowed_text_channels) {
		return true;
	}

	return false;
}

export async function ensureVoiceConnection(bot: Bot, guildId: BigString) {
	const channels = await getChannels(bot, guildId);
	const guild = await getGuild(bot, <BigString>guildId);
	let channelId = <BigString>"";
	for(let [id, channel] of channels) {
		if(channel.type == 2 && configs.allowed_voice_channels.includes(`${guild.name.toLowerCase()}:${channel.name.toLowerCase()}`)) {// voice channel
			channelId = id;
		}
	}

	await getChannel(bot, channelId);
	try {
		await bot.helpers.connectToVoiceChannel(guildId, channelId);
	} catch(err) {
		console.error(err);
	}
}

export function formatCallbackData(text: string, title?: string) {
	if(title) {
		return <InteractionCallbackData>{
			title: title,
			content: "",
			embeds: [<Embed>{
				color: configs.embed_color,
				description: text
			}]
		}		
	}
	return <InteractionCallbackData>{
		content: "",
		embeds: [<Embed>{
			color: configs.embed_color,
			description: text
		}]
	}
}

export async function getAllowedTextChannel(bot: Bot, guildId: bigint) {
	const channels = await getChannels(bot, guildId);
	const guild = await getGuild(bot, <BigString>guildId);
	let channelId = BigInt(0);
	for(let [id, channel] of channels) {
		if(channel.type == 0 && configs.allowed_text_channels.includes(`${guild.name.toLowerCase()}:${channel.name.toLowerCase()}`)) {// text channel
			channelId = id;
		}
	}

	return await getChannel(bot, channelId);
}

export const waitingForResponse = <InteractionResponse>{
	type: 4,
	data: {
		content: "waiting for response..."
	}
};

function errorMessage(bot: Bot, guildId: bigint, message: string) {
	const player = bot.helpers.getPlayer(guildId);
	return <CreateMessage>{
		embeds: [<Embed>{
			color: configs.embed_color,
			description: message
		}]
	}
}

export async function errorMessageCallback(guildId: bigint, message: string) {
	const channel = await getAllowedTextChannel(bot, guildId);
	await sendMessage(bot, channel.id, errorMessage(bot, guildId, message));
}

export function parseYoutubeId(url: string) {
	return url.substring(url.indexOf("?")+3);
}