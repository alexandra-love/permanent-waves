import { 
	Bot, 
	editOriginalInteractionResponse,
	Interaction,
	sendInteractionResponse,
	type CreateSlashApplicationCommand
} from "../deps.ts";

import { ensureVoiceConnection, formatCallbackData, waitingForResponse } from "../utils.ts";

const alreadyPausedResponse = formatCallbackData(`The player is already paused.`);

const emptyQueueResponse = formatCallbackData(`There's nothing in the queue right now.`);

const nowPausedResponse = formatCallbackData(`The player has been paused.`);

export const pauseCommand = <CreateSlashApplicationCommand>{
	name: "pause",
	description: "Pauses the player",
	dmPermission: false,
};

export const stopCommand = <CreateSlashApplicationCommand>{
	name: "stop",
	description: "Pauses the player, alias for /pause",
	dmPermission: false,
};

export async function pause(bot: Bot, interaction: Interaction) {
	if (!interaction.guildId) return;
	await ensureVoiceConnection(bot, interaction.guildId);
	const player = bot.helpers.getPlayer(interaction.guildId);
	await sendInteractionResponse(bot, interaction.id, interaction.token, waitingForResponse);

	if(player.playing && !player.waiting) {
		if(player.nowPlaying) {
			await player.pause();
			await editOriginalInteractionResponse(bot, interaction.token, nowPausedResponse);
		} else {
			await editOriginalInteractionResponse(bot, interaction.token, emptyQueueResponse);
		}
	} else {
		await editOriginalInteractionResponse(bot, interaction.token, alreadyPausedResponse);
	}
	
}