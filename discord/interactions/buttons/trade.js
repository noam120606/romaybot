const { errorEmbed } = require("../../../storage/constants.js");   

module.exports = {
    name: "tradebtn",

    async run(bot, interaction, tradeID) {
        
        const trade = bot.cards.getTrade(tradeID);

        if (!trade) return interaction.reply({ embeds: [errorEmbed(`Echange non trouvé ou expiré`)] });
        if (interaction.user.id !== trade.requesterId && interaction.user.id !== trade.targetId) return interaction.reply({ embeds: [errorEmbed(`Vous n'êtes pas dans cet echange`)] });
        
        await trade.ButtonInteraction(interaction, interaction.customId);

    },
};