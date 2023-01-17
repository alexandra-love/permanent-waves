import { configs } from "./configs.ts";
import { 
	Bot,
	createBot,  
	Intents, 
	startBot, 
	upsertGlobalApplicationCommands
} from "./deps.ts";
import { parseCommand } from "./commands.ts";
import { cyan, yellow } from "https://deno.land/std@0.161.0/fmt/colors.ts";
import { helpCommand } from "./commands/help.ts";
import { leaveCommand } from "./commands/leave.ts";
import { loopCommand } from "./commands/loop.ts";
import { npCommand } from "./commands/np.ts";
import { pauseCommand } from "./commands/pause.ts";
import { playCommand } from "./commands/play.ts";
import { skipCommand } from "./commands/skip.ts";
import { unloopCommand } from "./commands/unloop.ts";

import { enableAudioPlugin } from "./discordeno-audio-plugin/mod.ts";

let sessionId = "";

const baseBot = createBot({
	token: configs.discord_token,
	intents: Intents.Guilds | Intents.GuildMessages | Intents.GuildVoiceStates,
});

export const bot = enableAudioPlugin(baseBot);

bot.events.ready = async function (bot, payload) {
	//await registerCommands(bot);
	console.log(`${cyan("permanent waves")} is ready to go with session id ${yellow(payload.sessionId)}`);
	sessionId = payload.sessionId;
}

// Another way to do events
bot.events.interactionCreate = async function (bot, interaction) {
	await parseCommand(bot, interaction);
};

await startBot(bot);

async function registerCommands(bot: Bot) {
	console.log(await upsertGlobalApplicationCommands(bot, [helpCommand, leaveCommand, loopCommand, npCommand, pauseCommand, playCommand, skipCommand, unloopCommand]));
}

/*
import ytdl from "https://deno.land/x/ytdl_core/mod.ts";

const stream = await ytdl("DhobsmmyGFs", { filter: "audio" });

const chunks: Uint8Array[] = [];

for await (const chunk of stream) {
  chunks.push(chunk);
}

const blob = new Blob(chunks);
await Deno.writeFile("video.mp3", new Uint8Array(await blob.arrayBuffer()));*/