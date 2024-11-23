const { errorEmbed } = require("../../../storage/constants.js");

module.exports = {
    name: "inventory-selector",
    
    async run (bot, interaction, userId, max) {

        const page = interaction.fields.getTextInputValue('page');
        if (isNaN(page)) return interaction.reply({embeds:[errorEmbed("Tu n'a pas saisis un nombre")],ephemeral:true});
        if (page < 1) return interaction.reply({embeds:[errorEmbed("Tu n'a pas saisis un nombre supérieur ou égal à 1")],ephemeral:true});
        if (page-1 > max) return interaction.reply({embeds:[errorEmbed(`Tu n'a pas saisis un nombre inferieur au maximum (${max})`)],ephemeral:true});

        const inventory = await bot.cards.getInventory(interaction.user.id);
        const reponse = await inventory.getPage(userId, parseInt(page)-1);

        await interaction.update(reponse);
    }
}