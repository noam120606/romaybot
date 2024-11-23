const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "ping",

    async run(bot, interaction, action) {
        switch (action) {
            case "refresh": {
                await interaction.update({
                    content: `Ping: \`${bot.ws.ping}\``,
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Secondary)
                                    .setLabel("Refresh")
                                    .setCustomId("ping_refresh"),
                            ),
                    ],
                    ephemeral: true,
                });
                break;
            };
        };
    },
};