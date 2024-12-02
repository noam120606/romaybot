const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { errorEmbed } = require('../../../storage/constants.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pay")
        .setDescription("Donne des rubis a un membre")
        .addUserOption(option => option
            .setName("membre")
            .setDescription("Le membre")
            .setRequired(true)
        )
        .addNumberOption(option => option
            .setName("nombre")
            .setDescription("Le nombre de rubis")
            .setRequired(true)
            .setMinValue(1)
        ),
    
    async run (bot, interaction) {

        const user = interaction.options.getUser("membre");
        const amount = interaction.options.getNumber("nombre");

        const senderMonnaie = await bot.twitch.levels.get(interaction.user.id, true);
        const receiverMonnaie = await bot.twitch.levels.get(user.id, true);

        if (!senderMonnaie) return interaction.reply({ embeds: [errorEmbed("Vous n'avez pas de monnaie ou pas lié votre compte twitch")], ephemeral: true });
        if (!receiverMonnaie) return interaction.reply({ embeds: [errorEmbed("Le membre n'a pas de monnaie ou n'a pas lié son compte twitch")], ephemeral: true });
        
        if (senderMonnaie < amount) return interaction.reply({ embeds: [errorEmbed("Tu n'avez pas assez d'argent")], ephemeral: true });

        await bot.twitch.levels.remove(user.id, amount, true);
        await bot.twitch.levels.add(interaction.user.id, amount, true);

        interaction.reply(`<@${interaction.user.id}> à donné ${amount} ${bot.config.twitch.monnaie.symbol} à <@${user.id}> !`);

    },
};