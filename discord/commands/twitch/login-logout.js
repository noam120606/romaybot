const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('twitch')
        .setDescription('Connecte toi a ton compte twitch')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand.setName('login').setDescription('Connecte toi a ton compte twitch'))
        .addSubcommand(subcommand => subcommand.setName('logout').setDescription('Deconnecte toi de ton compte twitch')),
    
    async run(bot, interaction) {

        switch (interaction.options.getSubcommand()) {
            case 'login': {

                const embed = new EmbedBuilder()
                    .setTitle('Connecte toi a ton compte twitch')
                    .setDescription('Clique sur le bouton ci-dessous')
                    .setColor("#FF00FF")
                const linkBtn = new ButtonBuilder()
                    .setLabel('Se connecter')
                    .setStyle(ButtonStyle.Link)
                    .setURL(bot.config.oauth.loginUrl+"?reconnect=true");
                const row = new ActionRowBuilder()
                    .addComponents(linkBtn);

                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

                break;
            }
            case 'logout': {
                const embed = new EmbedBuilder()
                    .setTitle('Deconnecte toi de ton compte twitch')
                    .setDescription('Clique sur le bouton ci-dessous')
                    .setColor("#FF00FF")
                const logoutBtn = new ButtonBuilder()
                    .setLabel('Se deconnecter')
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('logout');
                const cancelBtn = new ButtonBuilder()
                    .setLabel('Annuler')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('cancel');
                const row = new ActionRowBuilder()
                    .addComponents(logoutBtn, cancelBtn);

                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
                break;
            }
        }

    }
};