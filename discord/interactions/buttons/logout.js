const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "logout",

    async run(bot, interaction) {
        await bot.db.unlink(interaction.user.id);
        await interaction.reply({ content: "Compte deconnecté avec succes", ephemeral: true });
        await interaction.message.delete();
    },
};