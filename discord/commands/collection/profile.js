const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { errorEmbed } = require('../../../storage/constants.js');
const progressBar = require('../../../functions/progressBar.js');
const { cartes, rarity } = require('../../../storage/cartes.js');

module.exports = {
    channels: ['1309525359854620763', '1309525539840593940', '1311134243266498691', '1309915134113746995'],
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Donne le profil d'un membre")
        .setDMPermission(false)
        .addUserOption(option => option
            .setName("membre")
            .setDescription("Le membre")
            .setRequired(false)
        ),

    async run(bot, interaction) {

        const member = interaction.options.getMember("membre") || interaction.member;
        if (!member) return await interaction.reply({embeds:[errorEmbed("Le membre n'a pas été trouvé")],ephemeral:true});

        const inventory = await bot.cards.getInventory(member.id);
        const userCards = getDetails(bot, inventory.getData().cards);
        const progressPercent = userCards.length / bot.config.card_max * 100;

        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(member.roles?.highest?.color || bot.primary)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setDescription([
                `**Cartes totales :** ${userCards.length}`,
                ...rarity.map(r => `> **${r.name} :** ${userCards.filter(card => card.rarity == r.id).length} / ${cartes.filter(card => card.rarity == r.id).length}`),
                ``,
                `**Cartes manquantes :** ${bot.config.card_max - userCards.length + 1}`,
                `${progressBar(progressPercent, 12)} (${progressPercent.toFixed(2)}%)`,
            ].join('\n'));
        
        const webButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Voir le site")
            .setURL(`https://romaybot.noam120606.fr/`);
        const row = new ActionRowBuilder()
            .addComponents(webButton);

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};

function getDetails(bot, data) {
    let formatedData = [];
    Object.entries(data).forEach(([key, value]) => {
        formatedData.push({ quantity: value, ...bot.cards.getCardData(key) });
    });
    return formatedData;
};