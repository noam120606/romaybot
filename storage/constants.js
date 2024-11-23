const { EmbedBuilder } = require("discord.js");

module.exports = {
    errorEmbed: (content) => {
        return new EmbedBuilder()
            .setTitle("❌ Une erreur s'est produite")
            .setColor(0xff0000)
            .setDescription(content)
            .setFooter({ text: "RomayBot" });
    },
}