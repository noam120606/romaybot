const { SlashCommandBuilder } = require("discord.js");
const { errorEmbed } = require("../../../storage/constants.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("money")
        .setDescription("Donne la monnaie d'un membre")
        .addUserOption(option => option
            .setName("membre")
            .setDescription("Le membre")
            .setRequired(false)
        ),
    
    async run (bot, interaction) {

        const user = interaction.options.getUser("membre") || interaction.user;
        const monnaie = await bot.twitch.levels.get(user.id, true);

        if (!monnaie) return interaction.reply({ embeds: [errorEmbed("Le membre n'a pas de monnaie ou n'a pas lié son compte twitch")], ephemeral: true });
        
        interaction.reply({ content: `<@${user.id}> possède ${monnaie} ${bot.config.twitch.monnaie.symbol}` });

    },
};