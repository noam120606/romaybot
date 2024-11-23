const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { twitch } = require('../../../config.js');
const { tiers, tiers_colors, tiers_prices, symbol, probabilities_de_drop } = twitch.monnaie;
const e = require('../../../storage/emojis.js');
const { errorEmbed } = require('../../../storage/constants.js');

module.exports = {
    channels: ['1309524945159716884'],
    must_linked: true,
    data: new SlashCommandBuilder()
        .setName("booster")
        .setDescription("Gestion des boosters")
        .addSubcommand(subcommand => subcommand
            .setName("buy")
            .setDescription("Acheter un booster")
            .addStringOption(option => option
                .setName("type")
                .setDescription("Le type de booster")
                .setRequired(true)
                .setChoices(
                    { name: `${tiers[0]} (${tiers_prices[0]} ${symbol})`, value: "1" },
                    { name: `${tiers[1]} (${tiers_prices[1]} ${symbol})`, value: "2" },
                    { name: `${tiers[2]} (${tiers_prices[2]} ${symbol})`, value: "3" },
                    { name: `${tiers[3]} (${tiers_prices[3]} ${symbol})`, value: "4" },
                )
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("info")
            .setDescription("Informations sur les crates")
        ),
    
    run: async (bot, interaction) => {

        const { options } = interaction;
        const subcommand = options.getSubcommand();

        if (subcommand === "buy") {

            await interaction.deferReply();

            const level = options.getString("type");

            const price = tiers_prices[parseInt(level) - 1];
            const monnaie = await bot.db.getMonnaie(interaction.user.id, true);
            if (monnaie < price) return interaction.editReply({ embeds: [errorEmbed("Vous n'avez pas assez d'argent !")], ephemeral: true });
            await bot.db.setMonnaie(interaction.user.id, monnaie - price, true);

            const droppedRarity = await generateRarities(parseInt(level));
            
            const droppedCards = [];
            for (let i = 0; i < 4; i++) {
                droppedCards.push(await bot.cards.giveRandomCard(interaction.user.id, droppedRarity[i]));
            };

            const embed = new EmbedBuilder()
                .setColor(tiers_colors[parseInt(level) - 1])
                .setTitle("Booster acheté")
                .setDescription(`Vous avez acheté un booster de tier **${tiers[parseInt(level) - 1]}** pour ${tiers_prices[parseInt(level)-1]} ${symbol}`)
                .addFields(
                    { name: "Cartes obtenues", value: droppedCards.map(c => `#${c.id} ${c.name} **[${c.rarityName}]** ${c.newCard ? e.multipart_new : ""}`).join("\n") }
                );
            
            return interaction.editReply({ embeds: [embed] });

        } else if (subcommand === "info") {

            const embed = new EmbedBuilder()
                .setColor(bot.primary)
                .setTitle("Information des boosters")
                .setDescription([
                    `Les packs permetent d'obtenir des cartes au hasard, plus le pack est haut niveau, plus il donne des cartes rares, mais il coute également plus cher`,
                ].join('\n'));
            
            const button = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Voir les probabilités')
                .setURL('https://docs.google.com/spreadsheets/d/1p0QINBnD1vzoNzCJCIAfVa1dSOqVEY_YFAR4KTOem64/edit?usp=sharing');

            const row = new ActionRowBuilder()
                .addComponents(button);
            
            return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }

    },

};

function getRandomRarity(probabilities) {
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < probabilities.length; i++) {
        sum += probabilities[i];
        if (random*100 < sum) return i;
    };
};

function generateRarities(tier) {
    const selectedProbabilities = probabilities_de_drop[tier];
    const rarities = [];
    for (let i = 0; i < 4; i++) rarities.push(getRandomRarity(selectedProbabilities));
    return rarities;
};