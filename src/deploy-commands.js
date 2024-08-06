const { REST, Routes } = require("discord.js");
const { token, BOT_ID, GUILD_ID } = require("../config.json");

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
  {
    name: "giveaway",
    description: "Start a giveaway",
    options: [
      {
        name: "duration",
        type: 3, // STRING
        description: "Duration of the giveaway (e.g., 10s, 5m, 1h)",
        required: true,
      },
      {
        name: "prize",
        type: 3, // STRING
        description: "The prize for the giveaway",
        required: true,
      },
      {
        name: "winners",
        type: 4, // INTEGER
        description: "Number of winners",
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(BOT_ID, GUILD_ID), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
