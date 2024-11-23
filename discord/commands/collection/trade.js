const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../../storage/constants.js');

module.exports = {
    channels: ['1309525359854620763'],
    must_linked: true,
    data: new SlashCommandBuilder()
        .setName("trade")
        .setDescription("Echange de cartes")
        .setDMPermission(false)
        .addUserOption(option => option
            .setName("membre")
            .setDescription("Le membre")
            .setRequired(true)
        ),

    run: async (bot, interaction) => {

        const member = interaction.options.getMember("membre");

        if (!bot.links.has(member.id)) return interaction.reply({ embeds: [errorEmbed("Le membre n'a pas lié son compte twitch")], ephemeral: true });

        if (!member) return interaction.reply({ embeds: [errorEmbed("Membre non trouvé")], ephemeral: true });
        if (member.user.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed("Tu ne peux pas te faire un echange avec toi même")], ephemeral: true });
        if (member.user.bot) return interaction.reply({ embeds: [errorEmbed("Tu ne peux pas faire un echange avec un bot")], ephemeral: true }); 
        
        const trade = bot.cards.createTrade(interaction.user.id, member.id);

        const msg = await interaction.channel.send(`Chargement de l'échange en cours...`);
        trade.setMSG(msg);
        trade.refreshMsg();

        await interaction.reply({ content: `L'echange a été lancé`, ephemeral: true });

    }
}

function getByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    }
}