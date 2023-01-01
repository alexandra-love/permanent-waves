import { 
	Bot, 
	editOriginalInteractionResponse,
	Interaction,
	sendInteractionResponse,
	type CreateSlashApplicationCommand
} from "../deps.ts";

import { ensureVoiceConnection, formatCallbackData, waitingForResponse } from "../utils.ts";

function notLoopingResponse(bot: Bot, interaction: Interaction) {
	const player = bot.helpers.getPlayer(interaction.guildId);
	return formatCallbackData(`Looping is already disabled. 
		Currently playing: **${player.nowPlaying.title}**, added by ${player.nowPlaying.added_by}`);
}

const nothingToLoopResponse = formatCallbackData(`The queue is empty.`);

function loopDisabledResponse(bot: Bot, interaction: Interaction) {
	const player = bot.helpers.getPlayer(interaction.guildId);
	return formatCallbackData(`Looping the current song has been disabled. 
			Currently playing: **${player.nowPlaying.title}**, added by ${player.nowPlaying.added_by}`);
}

export const unloopCommand = <CreateSlashApplicationCommand>{
	name: "unloop",
	description: "Disables looping the current song. At the current song's end, the queue will proceed as normal.",
	dmPermission: false,
};

export async function unloop(bot: Bot, interaction: Interaction) {
	if (!interaction.guildId) return;
	await ensureVoiceConnection(bot, interaction.guildId);
	const player = bot.helpers.getPlayer(interaction.guildId);
	await sendInteractionResponse(bot, interaction.id, interaction.token, waitingForResponse);

	if(!player.nowPlaying) {
		await editOriginalInteractionResponse(bot, interaction.token, nothingToLoopResponse);
	} else if(player.looping){
		await player.loop(false);
		await editOriginalInteractionResponse(bot, interaction.token, loopDisabledResponse(bot, interaction));
	} else {
		await editOriginalInteractionResponse(bot, interaction.token, notLoopingResponse(bot, interaction));
	}
}