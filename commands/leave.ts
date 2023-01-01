import { 
	Bot, 
	editOriginalInteractionResponse,
	getConnectionData,
	Interaction,
	leaveVoiceChannel,
	sendInteractionResponse,
	type CreateSlashApplicationCommand
} from "../deps.ts";

import { formatCallbackData, waitingForResponse } from "../utils.ts";

const notInVoiceResponse = formatCallbackData(`Permanent Waves isn't currently in a voice channel.`);

const leftResponse = formatCallbackData(`Left channel.`);

export const leaveCommand = <CreateSlashApplicationCommand>{
	name: "leave",
	description: "Makes the bot leave the current voice channel",
	dmPermission: false,
};

export async function leave(bot: Bot, interaction: Interaction) {
	if (!interaction.guildId) return;
	const conn = getConnectionData(bot.id, interaction.guildId);
	await sendInteractionResponse(bot, interaction.id, interaction.token, waitingForResponse);

	if(!conn.connectInfo.endpoint) {
		await editOriginalInteractionResponse(bot, interaction.token, notInVoiceResponse);
	} else {
		await leaveVoiceChannel(bot, interaction.guildId);
		await editOriginalInteractionResponse(bot, interaction.token, leftResponse);
	}	
}