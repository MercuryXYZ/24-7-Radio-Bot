"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const fs_1 = __importDefault(require("fs"));
const config = JSON.parse(fs_1.default.readFileSync("config.json", "utf8"));
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildVoiceStates
    ],
    partials: [discord_js_1.Partials.Channel]
});
client.once('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
    const channel = client.channels.cache.get(config.channel_id);
    if (!channel || channel.type !== discord_js_1.ChannelType.GuildVoice) {
        console.error(`The channel with ID ${config.channel_id} could not be found or is not a voice channel.`);
        return;
    }
    const voiceChannel = channel;
    const connectToChannel = () => {
        const connection = (0, voice_1.joinVoiceChannel)({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        const audioPlayer = (0, voice_1.createAudioPlayer)();
        const playStream = () => {
            var _a;
            const audioResource = (0, voice_1.createAudioResource)(config.stream_url, {
                inlineVolume: true,
            });
            (_a = audioResource.volume) === null || _a === void 0 ? void 0 : _a.setVolume(config.volume);
            audioPlayer.play(audioResource);
        };
        connection.subscribe(audioPlayer);
        playStream();
        audioPlayer.on(voice_1.AudioPlayerStatus.Playing, () => {
            console.log(`The bot now plays the radio station.`);
        });
        audioPlayer.on(voice_1.AudioPlayerStatus.Idle, () => {
            console.log(`The bot is now idle. Try restarting...`);
            playStream();
        });
        setInterval(() => {
            if (audioPlayer.state.status !== voice_1.AudioPlayerStatus.Playing) {
                console.log('The stream is not active. Try restarting...');
                playStream();
            }
        }, 60000);
    };
    try {
        connectToChannel();
        console.log(`The bot has successfully logged into the channel.`);
    }
    catch (error) {
        console.error(`Error logging into the channel: ${error}`);
    }
}));
client.login(config.token);
console.log((0, voice_1.generateDependencyReport)());
