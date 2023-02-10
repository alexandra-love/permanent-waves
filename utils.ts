import { ytdl } from "https://deno.land/x/ytdl_core@v0.1.1/mod.ts";
import { Bot } from "https://deno.land/x/discordeno@18.0.1/bot.ts";
import { connectToVoiceChannel } from "https://deno.land/x/discordeno@18.0.1/helpers/guilds/mod.ts";
import { configs } from "./configs.ts";
import { getChannel, getChannels, getGuild, type BigString, type Embed, type InteractionCallbackData, type InteractionResponse } from "./deps.ts";


export function channelIsAllowed(guild: string, channel: string) {
	if(`${guild}:${channel}` in configs.allowed_text_channels) {
		return true;
	}

	return false;
}

export async function download(url: string) {
	try {
		const stream = await ytdl(url, { filter: "audio" });

		const chunks: Uint8Array[] = [];

		for await (const chunk of stream) {
		  chunks.push(chunk);
		}

		const videoDetails = stream.videoInfo.videoDetails;
		const blob = new Blob(chunks);
		const result = await Deno.writeFile(`${configs.project_root}/music/${videoDetails.videoId}.mp3`, new Uint8Array(await blob.arrayBuffer()));
		return {
			result: true,
			message: `Now playing **${videoDetails.title}**`
		};
	} catch(err) {
		console.error(err);
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

	const channel = await getChannel(bot, channelId);
	try {
		const connection = await bot.helpers.connectToVoiceChannel(guildId, channelId);
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