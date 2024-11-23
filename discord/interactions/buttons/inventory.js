const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require("discord.js");

module.exports = {
    name: "inventory",

    async run(bot, interaction, action, arg1=undefined, arg2=undefined, arg3=undefined) {

        switch (action) {

            case "page": {

                if (arg1 == "selector") {

                    const modal = new ModalBuilder()
                        .setCustomId(`inventory-selector_${arg2}_${arg3}`)
                        .setTitle("Choisir une page");

                    modal.addComponents(new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("page")
                            .setLabel(`Page (entier entre 1 et ${parseInt(arg3) + 1})`)
                            .setStyle("Short")
                            .setRequired(true)
                    ));

                    await interaction.showModal(modal);

                } else {

                    const page = arg1;
                    const userId = arg2;

                    const inventory = await bot.cards.getInventory(userId);
                    const reponse = await inventory.getPage(userId, page);

                    await interaction.update(reponse);

                }
                break;
            };
        };
    },
};