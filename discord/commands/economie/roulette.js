const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed } = require('../../../storage/constants.js');
const randint = require('../../../functions/randint.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roulette")
        .setDescription("Jouez au jeu de la roulette")
        .addNumberOption(option => option
            .setName("mise")
            .setDescription("La mise")
            .setRequired(true)
            .setMinValue(100)
        )
        .addStringOption(option => option
            .setName("couleur")
            .setDescription("La couleur")
            .setRequired(true)
            .addChoices(
                { name: '🔴 Rouge', value: 'rouge' },
                { name: '⚫ Noir', value: 'noir' },
                { name: '🟢 Vert', value: 'vert' }
            )
        ),

    async run(bot, interaction) {

        let monnaie = await bot.db.getMonnaie(interaction.user.id, true);
        if (!monnaie) return interaction.reply({ embeds: [errorEmbed("Vous n'avez pas de monnaie ou pas lié votre compte twitch")], ephemeral: true });

        const mise = interaction.options.getNumber("mise");
        const couleur = interaction.options.getString("couleur");

        if (mise > monnaie) return interaction.reply({ embeds: [errorEmbed(`Vous n'avez pas assez d'argent (${monnaie} ${bot.config.twitch.monnaie.symbol})`)], ephemeral: true });
        
        const num = randint(0, 36);
        let roulette;
        if (num % 2 == 0) roulette = 'noir';
        if (num % 2 == 1) roulette = 'rouge';
        if (num == 0) roulette = 'vert';

        let string = `<@${interaction.user.id}> | La roulette tombe sur `;
        if (roulette == 'noir') string += `${num} (⚫ Noir)`;
        if (roulette == 'rouge') string += `${num} (🔴 Rouge)`
        if (roulette == 'vert') string += `${num} (🟢 Vert)`;

        bot.db[roulette == couleur ? 'addMonnaie' : 'removeMonnaie'](interaction.user.id, roulette == 'vert' && roulette == couleur ? mise*50 : mise, true);
        await interaction.reply(`${string} | Vous avez ${roulette == couleur ? 'gagné' : 'perdu'} ${roulette == 'vert' && roulette == couleur ? mise*50 : mise} ${bot.config.twitch.monnaie.symbol} !`);

    }
}