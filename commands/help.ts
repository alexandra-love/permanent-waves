import {
	Bot, 
	Interaction, 
	sendPrivateInteractionResponse, 
	type ApplicationCommandOption,
	type ApplicationCommandOptionChoice,
	type CreateSlashApplicationCommand, 
	type InteractionResponse 
} from "../deps.ts";

const helpChoices = [
	<ApplicationCommandOptionChoice>{
		name: "play",
		value: "play"
	}
];

const helpResponse = <InteractionResponse>{
	type: 4, // ChannelMessageWithSource 
	data: {
		content: `/help: displays this message\n/play: plays a song`
	}
}

const playResponse = <InteractionResponse>{
	type: 4, // ChannelMessageWithSource 
	data: {
		content: `/play: Add a song or playlist to the queue and starts the music if it's not already playing
		**Parameters:**
		url: A URL or video ID of the song or playlist to play`
	}
}

export const helpCommand = <CreateSlashApplicationCommand>{
	name: "help",
	description: "Lists the bot's commands and describes how to use them",
	dmPermission: false,
	options: [
	<ApplicationCommandOption>{
		type: 3, // string
		name: "command",
		description: "Displays additional info about a particular command",
		choices: helpChoices,
		required: false
	},
	]
};

export async function help(bot: Bot, interaction: Interaction) {
	if (!interaction.guildId) return;

	if(interaction.data.options) {
		switch(interaction.data.options[0].value) {
			case "play": {
				await sendPrivateInteractionResponse(bot, interaction.id, interaction.token, playResponse);
				break;
			}
		}
	} else {
		await sendPrivateInteractionResponse(bot, interaction.id, interaction.token, helpResponse);
	}
}
