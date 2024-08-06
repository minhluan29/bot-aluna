const {
  Client,
  IntentsBitField,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
} = require("discord.js");
const {
  AudioPlayer,
  createAudioResource,
  StreamType,
  entersState,
  VoiceConnectionStatus,
  joinVoiceChannel,
} = require("@discordjs/voice");
const discordTTS = require("discord-tts");
const TTS_C = new Map();
let voiceConnection;
let audioPlayer = new AudioPlayer();

try {
  OpusScript = require("@discordjs/opus");
} catch (err) {
  try {
    OpusScript = require("node-opus");
  } catch (err) {
    OpusScript = require("opusscript");
  }
}
const axios = require("axios");
const fs = require("fs");
const moment = require("moment");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const { validateEmbedColor, embedEqual } = require("./utils.js");
const ms = require("ms");

const {
  token,
  BOT_ID,
  REQUIRED_ROLE_ID,
  REQUIRED_ROLE_ID_BANANA_LINK_EMPLOYEES,
  PREFIX,
  PREFIX_NOI_TU,
} = require("../config.json");
const { character, nai, ga, tom, ca, bau, cua } = require("./common/data.json");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});
let giveaways = [];
let captchaChallenges = {};

let currentWord = "";

client.on("ready", (e) => {
  console.log(`Logged in ready! ${e.user.tag} !`);
});
function parseDuration(duration) {
  const match = duration.match(/(\d+)([smhd])/);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}
function generateCaptcha() {
  const characters = "0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
function startGiveaway(interaction, time, winnersCount, prize, description) {
  const endTime = Date.now() + ms(time);
  const giveaway = {
    endTime,
    winnersCount,
    prize,
    description,
    participants: new Set(),
    channelId: interaction.channelId,
    messageId: null,
    updateInterval: null,
  };

  giveaways.push(giveaway);

  setTimeout(() => endGiveaway(giveaway), endTime - Date.now());

  giveaway.updateInterval = setInterval(
    () => updateGiveawayMessage(giveaway),
    60000
  );

  return giveaway;
}
function updateGiveawayMessage(giveaway, ended = false) {
  const remainingTime = parseInt(parseInt(giveaway.endTime) / 1000);

  client.channels.cache
    .get(giveaway.channelId)
    .messages.fetch(giveaway.messageId)
    .then((message) => {
      const originalEmbed = message.embeds[0];

      const updatedEmbed = new EmbedBuilder()
        .setColor("#00C7FF")
        .setTitle("🎉 New Giveaway! 🎉")
        .addFields(
          { name: "Prize", value: `🏆 **${giveaway.prize}**`, inline: true },
          {
            name: "Winners",
            value: `👥 ${giveaway.winnersCount}`,
            inline: true,
          },
          {
            name: "Ends In",
            value: `⏳ ${ended ? "`Ended`" : `<t:${remainingTime}:R>`}

                    `,
            inline: true,
          },
          {
            name: "Participants",
            value: `👤 **${giveaway.participants.size}**`,
            inline: false,
          }
        );
      // .setFooter({ text: originalEmbed.footer.text })
      // .setTimestamp()
      // .setThumbnail(originalEmbed.thumbnail.url);

      message.edit({ embeds: [updatedEmbed] });
    })
    .catch(console.error);
}

function endGiveaway(giveaway) {
  clearInterval(giveaway.updateInterval);
  updateGiveawayMessage(giveaway, true);

  if (giveaway.participants.size === 0) {
    client.channels.cache
      .get(giveaway.channelId)
      .send("No participants in the giveaway. Winners were not chosen.");
    return;
  }

  const participants = Array.from(giveaway.participants);
  // participants.forEach((userId) => {
  //   const user = client.users.cache.get(userId);
  //   if (user) {
  //     saveUserToFile(user.username);
  //   }
  // });

  const winners = participants
    .sort(() => 0.5 - Math.random())
    .slice(0, giveaway.winnersCount)
    .map((userId) => `<@${userId}>`);

  const winnersText = winners.join(", ");
  const prizeText = giveaway.prize ? `**${giveaway.prize}**` : "the prize";
  const announcement = `🎉 The giveaway has ended! Congratulations to the winners: ${winnersText}! They won ${prizeText}! 🎉`;

  client.channels.cache.get(giveaway.channelId).send(announcement);
}
function msToTime(duration) {
  let minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return hours + "h " + minutes + "m";
}

//-----------------------Application - Commands-------------------------------
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  try {
    if (commandName === "ping") {
      const sent = await interaction.reply({
        content: "Pinging...",
        fetchReply: true,
      });
      const ping = sent.createdTimestamp - interaction.createdTimestamp;
      await interaction.editReply(
        `Pong! Latency is ${ping}ms. API Latency is ${Math.round(
          client.ws.ping
        )}ms`
      );
    }
  } catch (error) {
    console.log("🚀 ~ client.on ~ error:", error);
  }

  // try {
  //   if (commandName === "giveaway") {
  //     const duration = interaction.options.getString("duration");
  //     const prize = interaction.options.getString("prize");
  //     const winnersCount = interaction.options.getInteger("winners");

  //     const embed = new EmbedBuilder()
  //       .setTitle("🎉 Giveaway! 🎉")
  //       .setDescription(
  //         `Prize: **${prize}**\nDuration: **${duration}**\nWinners: **${winnersCount}**`
  //       )
  //       .setColor("#0000FF");

  //     const button = new ButtonBuilder()
  //       .setCustomId("giveaway_enter")
  //       .setLabel("Enter")
  //       .setStyle(ButtonStyle.Primary);

  //     const row = new ActionRowBuilder().addComponents(button);

  //     const giveawayMessage = await interaction.reply({
  //       embeds: [embed],
  //       components: [row],
  //       fetchReply: true,
  //     });

  //     const durational = parseDuration(duration) / 1000;

  //     for (let i = 1; i <= durational; i++) {
  //       const time = durational - i;
  //       const updatedEmbed = new EmbedBuilder()
  //         .setTitle("🎉 Giveaway! 🎉")
  //         .setDescription(
  //           `Prize: **${prize}**\nDuration: **${time}**\nWinners: **${winnersCount}**`
  //         )
  //         .setColor("#0000FF");

  //       await interaction.editReply({
  //         embeds: [updatedEmbed],
  //         components: [row],
  //         fetchReply: true,
  //       });
  //     }
  //     const filter = (i) =>
  //       i.customId === "giveaway_enter" && i.user.id !== client.user.id;
  //     const collector = giveawayMessage.createMessageComponentCollector({
  //       filter,
  //       time: parseDuration(duration),
  //     });

  //     const participants = new Set();

  //     collector.on("collect", async (i) => {
  //       if (!participants.has(i.user.id)) {
  //         participants.add(i.user.id);
  //         await i.reply({
  //           content: "You've entered the giveaway!",
  //           ephemeral: true,
  //         });
  //       } else {
  //         await i.reply({
  //           content: "You've already entered the giveaway.",
  //           ephemeral: true,
  //         });
  //       }
  //     });

  //     collector.on("end", async () => {
  //       const winners = Array.from(participants)
  //         .sort(() => 0.5 - Math.random())
  //         .slice(0, winnersCount);

  //       // Edit the giveaway message to show the winners
  //       const updatedEmbed = new EmbedBuilder()
  //         .setTitle("🎉 Giveaway! 🎉")
  //         .setDescription(
  //           `Prize: **${prize}**\nDuration: **${duration}**\nWinners: **${winnersCount}**\n\n` +
  //             `**Winners:** ${
  //               winners.length > 0
  //                 ? winners.map((id) => `<@${id}>`).join(", ")
  //                 : "No winners"
  //             }`
  //         )
  //         .setColor("#00FF00");

  //       await giveawayMessage.edit({ embeds: [updatedEmbed], components: [] });

  //       if (winners.length > 0) {
  //         await interaction.followUp(
  //           `Congratulations to the winners: ${winners
  //             .map((id) => `<@${id}>`)
  //             .join(", ")}! You won **${prize}**!`
  //         );
  //       } else {
  //         await interaction.followUp("No winners could be determined.");
  //       }
  //     });
  //   }
  // } catch (error) {
  //   console.log("🚀 ~ .join ~ error:", error);
  // }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  if (commandName === "giveaway") {
    await interaction.deferReply({ ephemeral: true });

    const time = interaction.options.getString("duration");
    const winnersCount = parseInt(
      interaction.options.getInteger("winners"),
      10
    );
    const prize = interaction.options.getString("prize");
    const description = interaction.options.getString("description");

    const giveaway = startGiveaway(
      interaction,
      time,
      winnersCount,
      prize,
      description
    );

    const embed = new EmbedBuilder()
      .setColor("#00C7FF")
      .setTitle("🎉 New Giveaway! 🎉")
      .setDescription(`**${description}**`);
    // .addField("Prize", `🏆 **${prize}**`, true)
    // .addField("Number of Winners", `👥 ${winnersCount}`, true)
    // .addField("Ends In", `⏳ ${msToTime(ms(time))}`, true)
    // .setFooter("Click on 🎉 to join!")
    // .setTimestamp()
    // .setThumbnail(
    //   "https://media.discordapp.net/attachments/1178000797825503352/1178501200769974373/logo_1.png?ex=65765fc5&is=6563eac5&hm=6cb5054b570777c3e458f8ccf384421a44a97aca2fc8414d26b4f5e31fd9ab54&=&format=webp&width=738&height=675"
    // );

    const joinButton = new ButtonBuilder()
      .setCustomId(`joinGiveaway_${giveaway.endTime}`)
      .setLabel("Join")
      .setStyle("Primary")
      .setEmoji("🎉");

    const row = new ActionRowBuilder().addComponents(joinButton);

    interaction.channel
      .send({ embeds: [embed], components: [row] })
      .then((sentMessage) => {
        giveaway.messageId = sentMessage.id;
        updateGiveawayMessage(giveaway);
      });

    await interaction.followUp({
      content: "Process completed!",
      ephemeral: true,
    });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isButton() &&
    interaction.customId.startsWith("joinGiveaway")
  ) {
    const giveawayId = interaction.message.id;
    const giveaway = giveaways.find(
      (g) => g.endTime > Date.now() && g.messageId === giveawayId
    );

    if (giveaway) {
      const userId = interaction.user.id;

      if (giveaway.participants.has(userId)) {
        await interaction.reply({
          content: "You have already joined this giveaway!",
          ephemeral: true,
        });
      } else {
        const captcha = generateCaptcha();
        captchaChallenges[userId] = { captcha, giveawayId };

        const captchaModal = new ModalBuilder()
          .setCustomId("captchaModal")
          .setTitle(`Captcha Code: ${captcha}`);

        const captchaInput = new TextInputBuilder()
          .setCustomId("captchaInput")
          .setLabel("Type the captcha code below")
          .setPlaceholder("Captcha Code")
          .setStyle("Short");

        const actionRow = new ActionRowBuilder().addComponents(captchaInput);

        captchaModal.addComponents(actionRow);

        await interaction.showModal(captchaModal);
      }
    } else {
      console.log("Giveaway not found or ended");
      await interaction.reply({
        content: "This giveaway has ended.",
        ephemeral: true,
      });
    }
  }

  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "captchaModal") {
    const captchaInput = interaction.fields.getTextInputValue("captchaInput");
    const userId = interaction.user.id;
    const captchaInfo = captchaChallenges[userId];

    if (captchaInfo && captchaInput === captchaInfo.captcha) {
      console.log("Correct CAPTCHA entered");
      const giveaway = giveaways.find(
        (g) => g.endTime > Date.now() && g.messageId === captchaInfo.giveawayId
      );

      if (giveaway) {
        giveaway.participants.add(userId);
        interaction.reply({
          content: "You have joined this giveaway!",
          ephemeral: true,
        });
        updateGiveawayMessage(giveaway);
      } else {
        console.log("Valid giveaway not found during CAPTCHA validation");
        interaction.reply({
          content: "This giveaway has ended or is no longer available!",
          ephemeral: true,
        });
      }
    } else {
      console.log("Incorrect CAPTCHA entered");
      interaction.reply({
        content: "لقد كتبت كود الكابتشا خطا, اعد المحاولة!",
        ephemeral: true,
      });
    }
    delete captchaChallenges[userId];
  }
});

//-----------------------BOT - SAY-------------------------------
client.on("messageCreate", async (msg) => {
  if (msg.content.startsWith("ns")) {
    const voiceChannel = msg.member.voice.channel;
    const text = msg.content.slice(3); // Extract text after the command
    if (!voiceChannel) return msg.reply("Bạn cần vào voice channel trước !");
    if (text.length < 1) return msg.reply("Bạn cần nhập nội dung cần nói !");
    if (TTS_C.get("start") && TTS_C.get("start").channel.id !== voiceChannel.id)
      return msg.reply("Tui đang phát ở một kênh khác, xin vui lòng chờ đợi !");
    const stream = discordTTS.getVoiceStream(text, { lang: "vi" });
    const audioResource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true,
    });
    if (
      !voiceConnection ||
      voiceConnection?.status === VoiceConnectionStatus.Disconnected
    ) {
      voiceConnection = joinVoiceChannel({
        channelId: msg.member.voice.channelId,
        guildId: msg.guildId,
        adapterCreator: msg.guild.voiceAdapterCreator,
      });
      voiceConnection = await entersState(
        voiceConnection,
        VoiceConnectionStatus.Connecting,
        5_000
      );
    }

    if (voiceConnection.status === VoiceConnectionStatus.Connected) {
      voiceConnection.subscribe(audioPlayer);
      await audioPlayer.play(audioResource);
      if (!TTS_C.get("start")) {
        TTS_C.set("start", {
          connect: voiceConnection,
          channel: voiceChannel,
        });
      }
      // if (timeoutID) {
      //   clearTimeout(timeoutID);
      // }
      // timeoutID = setTimeout(() => {
      //   voiceConnection.disconnect({
      //     channelId: msg.member.voice.channelId,
      //     guildId: msg.guildId,
      //     adapterCreator: msg.guild.voiceAdapterCreator,
      //   });
      //   TTS_C.delete("start");
      //   timeoutID = null; // Reset the timeoutID after it expires
      // }, timeoutDuration);
    }
  }
});
//-----------------------NỐI - TỪ-------------------------------
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return; // Bỏ qua các tin nhắn từ bot khác
  if (msg.content.startsWith(PREFIX_NOI_TU)) {
    const command = msg.content.slice(PREFIX_NOI_TU.length).trim().split(/ +/g);
    const cmd = command[0].toLowerCase();
    if (cmd === "startgame") {
      currentWord = character[Math.floor(Math.random() * character.length)]; // Reset từ hiện tại khi bắt đầu trò chơi mới
      let sentMessage = await msg.channel.send(
        "Let's start the Word Chain game! Please reply with a word that starts with any letter. " +
          `**${currentWord.toUpperCase()}**`
      );
      lastMessageId = sentMessage.id; // Lưu ID của tin nhắn vừa gửi
      return;
    }
    const userWord = cmd.toLowerCase();
    if (!userWord.startsWith(currentWord.charAt(currentWord.length - 1))) {
      msg.react("❌");
      return;
    }
    const isValidWord = await checkValidEnglishWord(userWord);
    if (isValidWord) {
      msg.react("✅");
      currentWord = userWord;
    } else {
      msg.react("❌");
    }
  }
});
async function checkValidEnglishWord(word) {
  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

client.on("messageCreate", async (message) => {
  const command = message.content.toLowerCase();
  const sendChannel = (mess) => message.channel.send(mess);
  !message.author.bot &&
    console.log(
      "user: ",
      message?.author?.globalName,
      " - ",
      "message: ",
      command
    );

  if (
    (message?.mentions?.repliedUser?.bot,
    message?.mentions?.repliedUser?.id === BOT_ID)
  ) {
    const tag1 = "**Tag cc, đang ngủ rồi**";
    const tag2 = "**Lo ăn cơm đi, tag cc**";
    const tag3 = "**Tag lần nữa là chết moẹ m với t**";
    const tag4 = "**Có vấn đề gì mà tag mình vậy bạn ?**";
    message.reply(
      Math.floor(Math.random() * 4) + 1 === 1
        ? tag1
        : 2 === 1
        ? tag2
        : 3 === 1
        ? tag3
        : tag4
    );
  }
  command === "thả tim" &&
    sendChannel(
      "**Tôi yêu bạn nhất mẹ luôn**" +
        "https://cdn.discordapp.com/attachments/1197485612744310815/1197485643756998736/image.png?ex=667359a9&is=66720829&hm=3a85718065bceb0d0cbf47e1dba32c49055808a2eb33cc812e2c1aa7bcef1adb&"
    );

  command === "gạch" &&
    message.reply(
      "https://cdn.discordapp.com/attachments/1096052903246053396/1219713864384647310/ED9670F1-60DA-4E5F-B79B-AB5B61685B78.gif?ex=6673cbce&is=66727a4e&hm=a269a8b3a75f4c99cb3e324f23b2bd9cc041d1bc84c2a1b9190c7eaba4aec937&"
    );
  command === "ping" && message.reply("**pong**");
  command === "hi" && message.reply("**Chào chào cc**");
  command === "hãi" && message.reply("**Hãi cc**");
  command === "lỏ" && message.reply("**Lỏ cc, mày mới lỏ á 😡**");
  command === "xấu" && message.reply("**Mày mới xấu á 😡**");
  command === "chạy" &&
    message.reply(
      "https://cdn.discordapp.com/emojis/1119378138246414346.gif?size=96&quality=lossless"
    );
  const hoi1 = "**Hỏi hỏi cl**";
  const hoi2 = "**Mày là đứa nào mà đòi ?**";
  const hoi3 = "**Cấm hỏi dưới mọi hình thức**";
  const hoi4 = "**Móc cái dấu hỏi dô họng m giờ chứ hỏi hỏi**";
  if (command === "?") {
    const random = Math.floor(Math.random() * 4) + 1;
    message.reply(
      random === 1 ? hoi1 : random === 2 ? hoi2 : random === 3 ? hoi3 : hoi4
    );
  }

  if (command.startsWith(`${PREFIX}rp`)) {
    const content = command.split("/");
    const userName = content[1];
    const day = content[2];
    const hour = content[3];
    if (!userName || !hour) {
      sendChannel(
        `**Please input full value !
        -rp/name/day(0:today,1:yesterday)/hour/Work 1/Work 2/Work 3/...**`
      );
      return;
    }
    message.delete();
    const currentDay = moment();
    currentDay.set({
      date: currentDay.date() - day,
    });

    content.shift();
    content.shift();
    content.shift();
    content.shift();
    // content[0] = `- ${content[0]}`;
    content.unshift("");
    sendChannel(
      "https://cdn.discordapp.com/attachments/1096052903246053396/1219713864384647310/ED9670F1-60DA-4E5F-B79B-AB5B61685B78.gif?ex=6675c60e&is=6674748e&hm=5b07cd6fd329930c5b56ef220a8b2d0474a622805c0bbacf2f0f42156835ae77&"
    );
    sendChannel(`Daily-Report: **${currentDay.format("DD/MM/YYYY")}**
      Name: **${userName.toLocaleUpperCase()}**
      Arrival time: **${hour}**
      ${content.join("\n - ")}`);
    sendChannel(
      "https://cdn.discordapp.com/attachments/1096052903246053396/1219713864384647310/ED9670F1-60DA-4E5F-B79B-AB5B61685B78.gif?ex=6675c60e&is=6674748e&hm=5b07cd6fd329930c5b56ef220a8b2d0474a622805c0bbacf2f0f42156835ae77&"
    );
  }
  command === "bú" &&
    sendChannel(
      "https://cdn.discordapp.com/attachments/1252257753359974420/1252500079386820669/IMG_7389.jpg?ex=66751419&is=6673c299&hm=73d06d02e160d0ba9fd3bd8181101c71af4216ece6b78a13832d286c14cdee2b&"
    );
  command === "rùa" &&
    sendChannel(
      "https://cdn.discordapp.com/emojis/1252468205415436409.webp?size=96&quality=lossless"
    );
  command === "luận" &&
    sendChannel(
      "https://cdn.discordapp.com/emojis/1252468533711999097.webp?size=96&quality=lossless"
    );
  command === "phương" &&
    sendChannel(
      "https://cdn.discordapp.com/emojis/1252470189518229605.webp?size=96&quality=lossless"
    );
  command === "hòa" &&
    sendChannel(
      "https://cdn.discordapp.com/emojis/1252470175727616073.webp?size=96&quality=lossless"
    );
  command.startsWith("tiến") &&
    sendChannel(
      "https://cdn.discordapp.com/emojis/1252824582302470164.webp?size=96&quality=lossless"
    );
  command.startsWith("dé") &&
    sendChannel(
      "https://cdn.discordapp.com/emojis/1252824582302470164.webp?size=96&quality=lossless"
    );

  command === "thương ngu" && sendChannel("Haha bạn nói đúng vãi c*c");

  command === "lz rùa" && sendChannel("Haha bạn nói đúng vãi c*c");

  command === "rùa ngu" && message.reply("Haha bạn nói đúng vãi c*c");

  command === "tag thương" && sendChannel("<@718342256154902579>");
  command === "tag phương" && sendChannel("<@605396496539713548>");
  command === "tag luận" && sendChannel("<@627211516697116732>");
  command === "tag hòa" && sendChannel("<@407685287410401281>");

  if (command.startsWith("stk")) {
    command === "stk rio" &&
      sendChannel(
        "https://cdn.discordapp.com/attachments/1208957435067502665/1236942120988971009/IMG_9164.jpg?ex=6672881e&is=6671369e&hm=5bb883ca380c263389175db8f26e1de7445f48dbdc3187f5d95a646ea97bcf96&"
      );
    command === "stk lucas" &&
      sendChannel(
        "https://media.discordapp.net/attachments/1208957435067502665/1225296244939690054/IMG_7754.jpg?ex=66725a0d&is=6671088d&hm=db1f3615f530a91772702ce735efa68c9e1bed907483d332e57986777baea3f9&=&format=webp&width=624&height=702"
      );
  }

  //-----------------RANDOM----------------

  if (command.startsWith(`${PREFIX}rd `)) {
    const num = command.split(" ")[1];
    message.reply(
      `Bạn đã random ra được **${
        Math.floor(Math.random() * num) + 1
      }** con rồng !`
    );
  }

  //-----------------BAU - CUA----------------
  if (command.startsWith(`${PREFIX}bc`)) {
    if (command.split(" ").length === 1) return message.reply("Sai cú pháp !");
    // Đếm ngược từ 5 đến 1
    for (let i = 3; i > 0; i--) {
      await sendChannel(`Game bắt đầu sau: ${i}`);
      await new Promise((resolve) => setTimeout(resolve, 900)); // Chờ 1 giây
    }
    await startBauCuaGame(message);
  }

  async function startBauCuaGame(message) {
    const imagesDir = path.join(__dirname, "assets/image", "baucua");
    const files = fs
      .readdirSync(imagesDir)
      .filter((file) => file.endsWith(".png"));

    if (files.length === 0) {
      return message.reply("Không có hình ảnh nào trong thư mục.");
    }

    // Logic game Bầu Cua
    const options = ["nai", "bau", "ga", "ca", "cua", "tom"];
    const result = [];

    // Xoay 3 lần
    for (let i = 0; i < 3; i++) {
      const choice = options[Math.floor(Math.random() * options.length)];
      result.push(choice);
    }
    // Lấy link hình ảnh
    const imagePaths = await Promise.all(
      result.map((item) => `src/assets/image/baucua/${item}.png`)
    );

    // Tạo canvas
    const buffer = await drawImagesAndBorder(imagePaths);
    // Gửi buffer trực tiếp tới kênh Discord
    const attachment = await new AttachmentBuilder(buffer);
    await sendChannel({ files: [attachment] });

    const results = result.map((item) => {
      let a = "";
      item === "bau" ? (a = bau) : null;
      item === "nai" ? (a = nai) : null;
      item === "ga" ? (a = ga) : null;
      item === "tom" ? (a = tom) : null;
      item === "ca" ? (a = ca) : null;
      item === "cua" ? (a = cua) : null;
      return a;
    });
    const bet = message.content.split(" ").map((item) => {
      let a = "";
      item.toLowerCase() == "bau" || item.toLowerCase() == "bầu"
        ? (a = bau)
        : null;
      item.toLowerCase() == "nai" ? (a = nai) : null;
      item.toLowerCase() == "ga" || item.toLowerCase() == "gà"
        ? (a = ga)
        : null;
      item.toLowerCase() == "tom" || item.toLowerCase() == "tôm"
        ? (a = tom)
        : null;
      item.toLowerCase() == "ca" || item.toLowerCase() == "cá"
        ? (a = ca)
        : null;
      item.toLowerCase() == "cua" ? (a = cua) : null;
      return a;
    });
    const isWin = results.filter(
      (item) => item.toLowerCase() === bet[1].toLowerCase()
    );

    sendChannel(`
     Người chơi: ${message.author.globalName} đặt cược **${bet[1]}**
      Kết quả: ** ${results.join(" 🔸 ")} **
      Bạn ${isWin.length > 0 ? "thằng 🎉" : "thua ❌"}  
      `);
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
  }
  async function drawImagesAndBorder(imagePaths) {
    // Kích thước canvas
    const width = 110 * imagePaths.length;
    const height = 120;

    // Tạo canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Màu nền cho canvas
    ctx.fillStyle = "#474952";
    ctx.fillRect(0, 0, width, height);

    // Tạo canvas tạm thời
    const tempCanvasWidth = 100; // Kích thước nhỏ hơn canvas chính
    const tempCanvasHeight = 100;
    const tempCanvas = createCanvas(tempCanvasWidth, tempCanvasHeight);
    const tempCtx = tempCanvas.getContext("2d");

    // Vẽ các hình ảnh lên canvas
    const promises = imagePaths.map((path, index) => {
      return loadImage(path).then((image) => {
        const x = index * (width / imagePaths.length) + 5;
        const y = 10;
        // Vẽ hình ảnh lên canvas tạm thời
        tempCtx.drawImage(image, 0, 0, tempCanvasWidth, tempCanvasHeight);

        // Chuyển hình ảnh từ canvas tạm thời sang canvas chính
        ctx.drawImage(tempCanvas, x, y, tempCanvasWidth, tempCanvasHeight);
      });
    });

    // Chờ cho tất cả các hình ảnh được vẽ lên
    await Promise.all(promises);
    // Vẽ viền radius
    ctx.strokeStyle = "#474952";
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, 0, 0, width, height, 20);

    // Chuyển canvas thành buffer
    return canvas.toBuffer("image/png");
  }

  //-----------------DELETE----------------

  if (command.startsWith("delete ")) {
    if (
      message.member.roles.cache.has(REQUIRED_ROLE_ID) ||
      message.member.roles.cache.has(REQUIRED_ROLE_ID_BANANA_LINK_EMPLOYEES) ||
      message.author.id === "627211516697116732"
    ) {
      const args = command.split(" ");
      if (args[1] && !isNaN(args[1])) {
        const deleteCount = parseInt(args[1], 10);

        if (deleteCount > 0 && deleteCount <= 100) {
          // Discord API giới hạn xóa tối đa 100 tin nhắn cùng lúc
          const fetchedMessages = await message.channel.messages.fetch({
            limit: deleteCount,
          });

          message.channel
            .bulkDelete(fetchedMessages)
            .then((deletedMessages) =>
              sendChannel(`Đã xóa ${deletedMessages.size} tin nhắn`)
            )
            .catch((error) => {
              console.error("Error while deleting messages:", error);
              sendChannel("Có lỗi xảy ra khi xóa tin nhắn.");
            });
        } else {
          sendChannel("Bạn phải nhập số lượng tin nhắn cần xóa từ 1 đến 100.");
        }
      } else {
        sendChannel("Vui lòng nhập một số hợp lệ.");
      }
    } else {
      return message.reply("Bạn không có quyền sử dụng lệnh này.");
    }
  }
  //-----------------CHECK - AVATAR----------------
  if (command.startsWith("avatar")) {
    const args = command.split(" ").slice(1);

    if (args.length === 0) {
      return;
    }

    let user;
    const query = args.join(" ");

    // Kiểm tra nếu đầu vào là userID
    if (/^\d+$/.test(query)) {
      try {
        user = await client.users.fetch(query);
      } catch (error) {
        console.error("Error fetching user by ID:", error);
        return message.reply("Không tìm thấy người dùng với userID này.");
      }
    }

    // Kiểm tra nếu đầu vào là tagUser
    if (!user && message.mentions.users.size) {
      user = message.mentions.users.first();
    }

    // Kiểm tra nếu đầu vào là username
    if (!user) {
      user = message.guild.members.cache.find(
        (member) => member.user.username === query || member.user.tag === query
      )?.user;
    }

    if (user) {
      return sendChannel(
        ` ${user.displayAvatarURL({
          dynamic: true,
          size: 1024,
        })}`
      );
    } else {
      return message.reply("Không tìm thấy người dùng với thông tin cung cấp.");
    }
  }

  //-----------------CHECK - BANNER----------------
  if (command.startsWith("banner")) {
    const args = command.split(" ").slice(1);

    if (args.length === 0) {
      return;
    }

    let user;
    const query = args.join(" ");

    // Kiểm tra nếu đầu vào là userID
    if (/^\d+$/.test(query)) {
      try {
        user = await client.users.fetch(query);
      } catch (error) {
        console.error("Error fetching user by ID:", error);
        return message.reply("Không tìm thấy người dùng với userID này.");
      }
    }

    // Kiểm tra nếu đầu vào là tagUser
    if (!user && message.mentions.users.size) {
      user = message.mentions.users.first();
    }

    // Kiểm tra nếu đầu vào là username
    if (!user) {
      user = message.guild.members.cache.find(
        (member) => member.user.username === query || member.user.tag === query
      )?.user;
    }

    if (user) {
      // return sendChannel(`${user.username}'s banner: ${bannerURL}`);

      return sendChannel(
        ` ${user.bannerURL({
          dynamic: true,
          size: 1024,
        })}`
      );
    } else {
      return message.reply("User not exist.");
    }
  }

  //-----------------LIST - EMLOYEE----------------
  if (command === "list-employee-banana") {
    try {
      const imagesDir = path.join(__dirname, "assets/image", "employee-banana");
      const files = fs
        .readdirSync(imagesDir)
        .filter((file) => file.endsWith(".jpg"));

      if (files.length === 0) {
        return message.reply("Không có hình ảnh nào trong thư mục.");
      }

      const imagePaths = await Promise.all(
        files.map((item) => `src/assets/image/employee-banana/${item}`)
      );
      // Tạo canvas
      if (imagePaths.length < 8) {
        const buffer = await drawImagesAndBorder(imagePaths);
        // Gửi buffer trực tiếp tới kênh Discord
        const attachment = await new AttachmentBuilder(buffer);
        await sendChannel({ files: [attachment] });
      } else {
        let image1 = [];
        let image2 = [];
        imagePaths.map((item, index) => {
          if (index < imagePaths.length / 2) {
            image1.push(item);
          } else {
            image2.push(item);
          }
        });
        const buffer1 = await drawImagesAndBorder(image1);
        const buffer2 = await drawImagesAndBorder(image2);
        // Gửi buffer trực tiếp tới kênh Discord
        const attachment1 = await new AttachmentBuilder(buffer1);
        const attachment2 = await new AttachmentBuilder(buffer2);
        await sendChannel({ files: [attachment1] });
        await sendChannel({ files: [attachment2] });
      }
    } catch (error) {
      await sendChannel("Có gì đó sai sai 🙄");
    }
  }

  //-----------------SPEAK - VOICE----------------
});

client.login(token);
