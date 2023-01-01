import { Bot, Interaction  } from "./deps.ts";
import { help } from "./commands/help.ts";
import { invalidCommand } from "./commands/invalid_command.ts";
import { leave } from "./commands/leave.ts";
import { loop } from "./commands/loop.ts"
import { np } from "./commands/np.ts";
import { pause } from "./commands/pause.ts";
import { play } from "./commands/play.ts";
import { skip } from "./commands/skip.ts";
import { unloop } from "./commands/unloop.ts";

import { red } from "https://deno.land/std@0.161.0/fmt/colors.ts";

export async function parseCommand(bot: Bot, interaction: Interaction) {
	if(!interaction.data) {
		console.log(red("invalid interaction data was passed through somehow:"));
		console.log(interaction);
		return;
	}
	switch(interaction.data.name) {
		case "help": {
			await help(bot, interaction);
			break;
		}
		case "leave": {
			await leave(bot, interaction);
			break;
		}
		case "loop": {
			await loop(bot, interaction);
			break;
		}
		case "np": {
			await np(bot, interaction);
			break;
		}
		case "pause": {
			await pause(bot, interaction);
			break;
		}
		case "play": {
			await play(bot, interaction);
			break;
		}
		case "skip": {
			await skip(bot, interaction);
			break;
		}
		case "unloop": {
			await unloop(bot, interaction);
			break;
		}
		default: {
			await invalidCommand(bot, interaction);
			break;
		}
	}
}
