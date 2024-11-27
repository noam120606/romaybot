const {} = require("discord.js");
const { errorEmbed } = require("../../../storage/constants.js");

module.exports = {
    name: "trademodal",
    
    async run(bot, interaction, tradeID) {
        
        const trade = bot.cards.getTrade(tradeID);

        if (!trade) return interaction.reply({ embeds: [errorEmbed(`Echange non trouvé ou expiré`)], ephemeral: true });
        if (interaction.user.id !== trade.requesterId && interaction.user.id !== trade.targetId) return interaction.reply({ embeds: [errorEmbed(`Vous n'êtes pas dans cet echange`)], ephemeral: true });
        
        await trade.ModalInteraction(interaction, interaction.customId);

    },
}