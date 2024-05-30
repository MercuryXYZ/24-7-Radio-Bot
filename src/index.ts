import { Client, GatewayIntentBits, Partials, VoiceChannel, ChannelType } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, generateDependencyReport } from '@discordjs/voice';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  const channel = client.channels.cache.get(config.channel_id);

  if (!channel || channel.type !== ChannelType.GuildVoice) {
    console.error(`The channel with ID ${config.channel_id} could not be found or is not a voice channel.`);
    return;
  }

  const voiceChannel = channel as VoiceChannel;

  const connectToChannel = () => {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const audioPlayer = createAudioPlayer();

    const playStream = () => {
      const audioResource = createAudioResource(config.stream_url, {
        inlineVolume: true,
      });

      audioResource.volume?.setVolume(config.volume);
      audioPlayer.play(audioResource);
    };

    connection.subscribe(audioPlayer);
    playStream();

    audioPlayer.on(AudioPlayerStatus.Playing, () => {
      console.log(`The bot now plays the radio station.`);
    });

    audioPlayer.on(AudioPlayerStatus.Idle, () => {
      console.log(`The bot is now idle. Try restarting...`);
      playStream();
    });

    setInterval(() => {
      if (audioPlayer.state.status !== AudioPlayerStatus.Playing) {
        console.log('The stream is not active. Try restarting...');
        playStream();
      }
    }, 60000);
  };

  try {
    connectToChannel();
    console.log(`The bot has successfully logged into the channel.`);
  } catch (error) {
    console.error(`Error logging into the channel: ${error}`);
  }
});

client.login(config.token);

console.log(generateDependencyReport());