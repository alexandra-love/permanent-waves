import { 
	Bot, 
	editOriginalInteractionResponse,
	Interaction,
	sendInteractionResponse,
	type CreateSlashApplicationCommand
} from "../deps.ts";

import { ensureVoiceConnection, formatCallbackData, waitingForResponse } from "../utils.ts";

function alreadyLoopingResponse(bot: Bot, interaction: Interaction) {
	const player = bot.helpers.getPlayer(interaction.guildId);
	return formatCallbackData(`Looping is already enabled. 
			Currently playing: **${player.nowPlaying.title}**, added by ${player.nowPlaying.added_by}`);
}

const nothingToLoopResponse = formatCallbackData(`The queue is empty.`);

function loopEnabledResponse(bot: Bot, interaction: Interaction) {
	const player = bot.helpers.getPlayer(interaction.guildId);
	return formatCallbackData(`Looping has been enabled. 
			Currently playing: **${player.nowPlaying.title}**, added by ${player.nowPlaying.added_by}`);
}

export const loopCommand = <CreateSlashApplicationCommand>{
	name: "loop",
	description: "Loops the currently playijng song. All other songs remain in the queue",
	dmPermission: false,
};

export async function loop(bot: Bot, interaction: Interaction) {
	if (!interaction.guildId) return;
	await ensureVoiceConnection(bot, interaction.guildId);
	const player = bot.helpers.getPlayer(interaction.guildId);
	await sendInteractionResponse(bot, interaction.id, interaction.token, waitingForResponse);

	if(!player.nowPlaying) {
		await editOriginalInteractionResponse(bot, interaction.token, nothingToLoopResponse);
	} else if(!player.looping){
		await player.loop(true);
		await editOriginalInteractionResponse(bot, interaction.token, loopEnabledResponse(bot, interaction));
	} else {
		await editOriginalInteractionResponse(bot, interaction.token, alreadyLoopingResponse(bot, interaction));
	}
}