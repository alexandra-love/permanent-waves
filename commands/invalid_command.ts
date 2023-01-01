import {
	Bot, 
	Interaction, 
	sendPrivateInteractionResponse,
	type InteractionResponse 
} from "../deps.ts";

export async function invalidCommand(bot: Bot, interaction: Interaction) {
	if (!interaction.guildId) return;
	await sendPrivateInteractionResponse(bot, interaction.id, interaction.token, invalidCommandResponse);
}

const invalidCommandResponse = <InteractionResponse>{
	type: 4, // ChannelMessageWithSource 
	data: {
		content: `Either you somehow sent an invalid command or waves didn't understand the command for some reason. Try again or poke sykora about it.`
	}
}