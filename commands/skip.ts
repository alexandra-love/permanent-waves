import { 
	Bot, 
	editOriginalInteractionResponse,
	Interaction,
	sendInteractionResponse,
	type CreateSlashApplicationCommand, 
} from "../deps.ts";

import { ensureVoiceConnection, formatCallbackData, waitingForResponse } from "../utils.ts";

const nothingToSkipResponse = formatCallbackData(`The queue is empty.`);

const skippedResponse = formatCallbackData(`The song has been skipped.`);

export const skipCommand = <CreateSlashApplicationCommand>{
	name: "skip",
	description: "Skips the current song",
	dmPermission: false,
};

export async function skip(bot: Bot, interaction: Interaction) {
	if (!interaction.guildId) return;
	await ensureVoiceConnection(bot, interaction.guildId);
	const player = bot.helpers.getPlayer(interaction.guildId);
	await sendInteractionResponse(bot, interaction.id, interaction.token, waitingForResponse);

	if(!player.nowPlaying) {
		await editOriginalInteractionResponse(bot, interaction.token, nothingToSkipResponse);
	} else {
		await player.skip();
		await editOriginalInteractionResponse(bot, interaction.token, skippedResponse);
	}	
}