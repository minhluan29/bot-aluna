const { Client, IntentsBitField, AttachmentBuilder } = require("discord.js");
const { GatewayIntentBits } = require("discord-api-types/v9");
const axios = require("axios");

const fs = require("fs");
const moment = require("moment");
const path = require("path");
const sharp = require("sharp");
const ytdl = require("ytdl-core");
const { createCanvas, loadImage } = require("canvas");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const { nai, ga, tom, ca, bau, cua } = require("./config.json");
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.AutoModerationConfiguration,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

const BOT_ID = "1252190977695809587";
const REQUIRED_ROLE_ID = "867755897672564776";
const REQUIRED_ROLE_ID_BANANA_LINK_EMPLOYEES = "1208958100347031603"; // Thay thế bằng ID của role cần kiểm tra
const PREFIX = "-";
const PREFIX_NOI_TU = ".";
let currentWord = "";
let lastMessageId = "";
const character = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

client.on("ready", (e) => {
  console.log(`Logged in ready! ${e.user.tag} !`);
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
  if (command.includes(`${PREFIX}bc`)) {
    // Đếm ngược từ 5 đến 1
    for (let i = 5; i > 0; i--) {
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

    sendChannel(`** Kết quả: ${results.join(" 🔸 ")} **`);
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

  //-----------------MUSIC----------------
  if (command.startsWith("music ")) {
    const args = command.split(" ");
    const url = args[1];

    if (!ytdl.validateURL(url)) {
      return message.reply("Please provide a valid YouTube link.");
    }

    if (message.member.voice.channel) {
      const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      connection.on(VoiceConnectionStatus.Ready, () => {
        console.log("The bot has connected to the channel!");
      });

      const stream = ytdl(url, { filter: "audioonly" });
      const resource = createAudioResource(stream);

      const player = createAudioPlayer();
      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () => {
        console.log("The audio player has started playing!");
      });

      player.on(AudioPlayerStatus.Idle, () => {
        console.log("The audio player is idle.");
        connection.destroy();
      });

      player.on("error", (error) => {
        console.error("Error:", error.message);
        connection.destroy();
      });
    } else {
      message.reply("You need to join a voice channel first!");
    }
  }
});

client.login();
