const { errorEmbed } = require("../../../storage/constants.js");
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    owner: true,
    data: new SlashCommandBuilder()
        .setName("moneymanager")
        .setDescription("Gestion des monnaies")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => subcommand
            .setName("set")
            .setDescription("Modifier la monnaie d'un membre")
            .addStringOption(option => option
                .setName("membre")
                .setDescription("Le membre")
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addNumberOption(option => option
                .setName("monnaie")
                .setDescription("La monnaie")
                .setRequired(true)
                .setMinValue(0)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("get")
            .setDescription("Obtenir la monnaie d'un membre")
            .addStringOption(option => option
                .setName("membre")
                .setDescription("Le membre")
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("add")
            .setDescription("Ajouter de la monnaie à un membre")
            .addStringOption(option => option
                .setName("membre")
                .setDescription("Le membre")
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addNumberOption(option => option
                .setName("monnaie")
                .setDescription("La monnaie")
                .setRequired(true)
                .setMinValue(0)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("remove")
            .setDescription("Retirer de la monnaie à un membre")
            .addStringOption(option => option
                .setName("membre")
                .setDescription("Le membre")
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addNumberOption(option => option
                .setName("monnaie")
                .setDescription("La monnaie")
                .setRequired(true)
                .setMinValue(0)
            )
        ),

    async autocomplete(bot, interaction) {
        const focusedValue = interaction.options.getFocused();
        const board = await bot.db.getLeaderboard();
        const users = await bot.db.getUserData();
        const selection = board.filter(m => focusedValue=='' || users.find(u => u.userid == m.user).username.toLowerCase().includes(focusedValue.toLowerCase()));
        const data = selection.map(m => ({ name: users.find(u => u.userid == m.user).username, value: m.user }));
        return data;
    },

    async run(bot, interaction) {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getString("membre");
        const monnaie = interaction.options.getNumber("monnaie");

        const twitchUsername = await bot.db.getUsername(user);
        if (!twitchUsername) return interaction.reply({ embeds: [errorEmbed("Le membre n'a pas de monnaie ou n'existe pas")], ephemeral: true });

        switch (subcommand) {
            case "set":
                await bot.twitch.levels.set(user, monnaie);
                await interaction.reply({ content: `${twitchUsername} possède ${monnaie} ${bot.config.twitch.monnaie.symbol}`, ephemeral: true });
            break;
            case "get":
                const monnaieUser = await bot.twitch.levels.get(user);
                if (!monnaieUser) return interaction.reply({ embeds: [errorEmbed("Le membre n'a pas de monnaie ou n'a pas lié son compte twitch")], ephemeral: true });
                await interaction.reply({ content: `${twitchUsername} possède ${monnaieUser} ${bot.config.twitch.monnaie.symbol}`, ephemeral: true });
            break;
            case "add":
                await bot.twitch.levels.add(user, monnaie);
                await interaction.reply({ content: `${twitchUsername} possède ${await bot.twitch.levels.get(user)} ${bot.config.twitch.monnaie.symbol}`, ephemeral: true });
            break;
            case "remove":
                await bot.twitch.levels.remove(user, monnaie);
                await interaction.reply({ content: `${twitchUsername} possède ${await bot.twitch.levels.get(user)} ${bot.config.twitch.monnaie.symbol}`, ephemeral: true });
            break;
        }
    }
}