const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "cancel",

    async run(bot, interaction) {
        await interaction.reply({ content: "Action annulée", ephemeral: true });
        await interaction.message.delete();
    },
};