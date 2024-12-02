const { errorEmbed } = require("../../../storage/constants.js");
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    owner: true,
    data: new SlashCommandBuilder()
        .setName("savedb")
        .setDescription("Sauvegarde (proprement) le bot")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async run(bot, interaction) {
        await interaction.reply({ content: "Le bot se coupe", ephemeral: true });
        await bot.save();
    }
}