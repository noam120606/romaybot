const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed } = require('../../../storage/constants.js');
const { card_max } = require('../../../config.js');

module.exports = {
    channels: ['1309525539840593940'],
    must_linked: true,
    data: new SlashCommandBuilder()
        .setName("inventaire")
        .setDescription("Donne l'inventaire d'un membre")
        .addUserOption(option => option
            .setName("membre")
            .setDescription("Le membre")
            .setRequired(false)
        )
        .addNumberOption(option => option
            .setName("id")
            .setDescription("L'id de la carte")
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(card_max),
        ),
    
    async run(bot, interaction) {

        const user = interaction.options.getUser("membre") || interaction.user;
        const inventory = await bot.cards.getInventory(user.id);

        if (inventory.isEmpty()) return interaction.reply({embeds:[errorEmbed("Le membre n'a pas de carte")],ephemeral:true});

        let page = 0;
        const requestId = interaction.options.getNumber("id");
        if (requestId) page = inventory.idToPage(requestId);

        if (page == -1) return interaction.reply({embeds:[errorEmbed(`Le membre n'a pas l'a carte d'identifiant ${requestId}`)],ephemeral:true});

        const reponse = await inventory.getPage(user.id, page);

        await interaction.reply(reponse);

    },
};
