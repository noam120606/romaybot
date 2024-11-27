const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const generateId = require('../../functions/generateId.js');
const e = require('../../storage/emojis.js');
const { errorEmbed } = require('../../storage/constants.js');

class Trade {
    constructor(bot, requesterId, targetId, tradeID=null) { 
        this.bot = bot;
        this.requesterId = requesterId;
        this.targetId = targetId;
        this.tradeId = tradeID ?? generateId();
        this.msg = null;
        this.completed = false;

        this.trade = {
            [requesterId]: {
                cards: {},
                money: 0,
                accept: false,
            },
            [targetId]: {
                cards: {},
                money: 0,
                accept: false,
            },
        };
    };

    setMSG(msg) {
        this.msg = msg;
    }

    cancelAccept() {
        this.trade[this.requesterId].accept = false;
        this.trade[this.targetId].accept = false;
    };

    setCard(userId, id, quantity=1) {
        this.cancelAccept();
        if (userId != this.requesterId && userId != this.targetId) throw new Error('Invalid userId');
        this.trade[userId].cards[id] = quantity;
        if (this.trade[userId].cards[id] <= 0) delete this.trade[userId].cards[id];
        return this.trade[userId].cards;
    };

    removeCard(userId, id) {
        this.cancelAccept();
        if (userId != this.requesterId && userId != this.targetId) throw new Error('Invalid userId');
        delete this.trade[userId].cards[id];
        return this.trade[userId].cards;
    };

    setMoney(userId, amount) {
        this.cancelAccept();
        if (userId != this.requesterId && userId != this.targetId) throw new Error('Invalid userId');
        this.trade[userId].money = amount;
        if (this.trade[userId].money < 0) this.trade[userId].money = 0;
        return this.trade[userId].money;
    };

    toEmbed() {
        return new EmbedBuilder()
            .setColor("Orange")
            .setTitle('Un echange est en cours')
            .setFields([
                { name: `${getUsername(this.bot, this.requesterId)} propose :`, value: [
                    `>>> ${Object.keys(this.trade[this.requesterId].cards).map(id => `${this.trade[this.requesterId].cards[id]}x ${this.bot.cards.getCardData(id).name} **[${this.bot.cards.getCardData(id).rarityName}]**`).join('\n')}`,
                    `${this.trade[this.requesterId].money} ${this.bot.config.twitch.monnaie.symbol}`,
                    ``,
                    `${this.trade[this.requesterId].accept ? '✅ Ok' : '❌ Pas Ok'}`,
                ].join('\n'), inline: true },
                { name: `${getUsername(this.bot, this.targetId)} propose :`, value: [
                    `>>> ${Object.keys(this.trade[this.targetId].cards).map(id => `${this.trade[this.targetId].cards[id]}x ${this.bot.cards.getCardData(id).name} **[${this.bot.cards.getCardData(id).rarityName}]**`).join('\n')}`,
                    `${this.trade[this.targetId].money} ${this.bot.config.twitch.monnaie.symbol}`,
                    ``,
                    `${this.trade[this.targetId].accept ? '✅ Ok' : '❌ Pas Ok'}`,
                ].join('\n'), inline: true },
            ]);
    };

    toComponent() {
        return [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder() 
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(e.add)
                        .setCustomId(`tradebtn_${this.tradeId}_setCard`)
                        .setLabel('Ajouter une carte'),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(e.remove)
                        .setCustomId(`tradebtn_${this.tradeId}_removeCard`)
                        .setLabel('Retirer une carte'),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(this.bot.config.twitch.monnaie.symbol)
                        .setCustomId(`tradebtn_${this.tradeId}_setMoney`)
                        .setLabel('Mettre de la monnaie'),
                ),
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Success)
                        .setEmoji(e.accept)
                        .setCustomId(`tradebtn_${this.tradeId}_accept`)
                        .setLabel('Accepter'),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji(e.decline)
                        .setCustomId(`tradebtn_${this.tradeId}_decline`)
                        .setLabel('Ne plus l\'accepter'),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(e.cancel)
                        .setCustomId(`tradebtn_${this.tradeId}_cancel`)
                        .setLabel('Annuler'),
                ),
        ];
        
    };

    refreshMsg() {
        this.msg.edit({
            embeds: [this.toEmbed()],
            components: this.toComponent(),
        });
    };

    async ButtonInteraction(interaction, customId) {
        if (this.completed) return interaction.reply({ embeds: [errorEmbed(`L'échange est terminé !`)], ephemeral: true, });
        const [type, id, action] = customId.split('_');
        switch (action) { 
            case 'accept': {
                this.trade[interaction.user.id].accept = true;
                interaction.reply({
                    content: 'Echange accepté',
                    ephemeral: true,
                });
                this.refreshMsg();
                if (this.trade[this.requesterId].accept && this.trade[this.targetId].accept) {
                    this.completed = true;

                    console.log(this.trade);

                    interaction.channel.send(`L'échange entre <@${this.requesterId}> et <@${this.targetId}> est complété !`);
                    for (const cardId of Object.keys(this.trade[this.requesterId].cards)) {
                        this.bot.db.giveCard(this.targetId, cardId, parseInt(this.trade[this.requesterId].cards[cardId]));
                        this.bot.db.removeCard(this.requesterId, cardId, parseInt(this.trade[this.requesterId].cards[cardId]));
                    };
                    for (const cardId of Object.keys(this.trade[this.targetId].cards)) {
                        this.bot.db.giveCard(this.requesterId, cardId, parseInt(this.trade[this.targetId].cards[cardId]));
                        this.bot.db.removeCard(this.targetId, cardId, parseInt(this.trade[this.targetId].cards[cardId]));
                    };
                    if (this.trade[this.requesterId].money > 0) {
                        this.bot.twitch.levels.add(this.targetId, this.trade[this.requesterId].money, true);
                        this.bot.twitch.levels.remove(this.requesterId, this.trade[this.requesterId].money, true);
                    };
                    if (this.trade[this.targetId].money > 0) {
                        this.bot.twitch.levels.add(this.requesterId, this.trade[this.targetId].money, true);   
                        this.bot.twitch.levels.remove(this.targetId, this.trade[this.targetId].money, true);
                    };
                };
                break;
            };
            case 'decline': {
                this.trade[interaction.user.id].accept = false;
                this.refreshMsg();
                interaction.reply({
                    content: 'Echange non accepté',
                    ephemeral: true,
                });
                break;
            };
            case 'cancel': {
                await interaction.reply({ content: 'Echange annulé', ephemeral: true, });
                await this.msg.edit({
                    content: `> L'échange entre ${getUsername(this.requesterId)} et ${getUsername(this.targetId)} est annulé par <@${interaction.user.id}> !`,
                    components: [],
                    embeds: [],
                }); 
                this.bot.cards.deleteTrade(this.tradeId);
                break;
            };
            case 'setCard': {
                const modal = new ModalBuilder()
                    .setTitle('Ajouter une carte')
                    .setCustomId(`trademodal_${this.tradeId}_setCard`)
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId(`id`)
                                .setLabel('Identifiant de la carte')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true),
                        ),  
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId(`quantity`)
                                .setLabel('Quantité de cette carte')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true),
                        )
                    );
                await interaction.showModal(modal);
                break;
            };
            case 'removeCard': {
                const modal = new ModalBuilder()
                    .setTitle('Retirer une carte')
                    .setCustomId(`trademodal_${this.tradeId}_removeCard`)
                    .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId(`id`)
                            .setLabel('Identifiant de la carte')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true),
                    ),  
                );
                await interaction.showModal(modal);
                break;
            };
            case 'setMoney': {
                const modal = new ModalBuilder()
                    .setTitle('Ajouter de la monnaie')
                    .setCustomId(`trademodal_${this.tradeId}_setMoney`)
                    .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId(`amount`)
                            .setLabel('Quantité de monnaie à mettre')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true),
                    ),  
                );
                await interaction.showModal(modal);
                break;
            };
        };
    };

    async ModalInteraction(interaction, customId) { 
        if (this.completed) return interaction.reply({ embeds: [errorEmbed(`L'échange est terminé !`)], ephemeral: true, });
        const [type, id, action] = customId.split('_');
        switch (action) {
            case 'setCard': {
                const cardID = interaction.fields.getTextInputValue('id');
                const quantity = interaction.fields.getTextInputValue('quantity');
                const cardQuantity = await this.bot.db.getCards(interaction.user.id, cardID);
                if (quantity > cardQuantity) return await interaction.reply({ embeds: [errorEmbed(`Il n'y a que ${cardQuantity} cartes d'identifiant ${cardID} dans votre inventaire !`)], ephemeral: true, });
                this.setCard(interaction.user.id, cardID, quantity);
                this.refreshMsg();
                await interaction.reply({ content: `Cartes d'identifnant ${cardID} ajoutées au l'échange`, ephemeral: true, });
                break;
            };
            case 'removeCard': {
                const cardID = interaction.fields.getTextInputValue('id');
                this.removeCard(interaction.user.id, cardID);
                this.refreshMsg();
                await interaction.reply({ content: `Cartes d'identifnant ${cardID} supprimées du l'échange`, ephemeral: true, });
                break;
            };
            case 'setMoney': {
                const amount = interaction.fields.getTextInputValue('amount');
                const money = await this.bot.twitch.levels.get(interaction.user.id, true);
                if (amount > money) return await interaction.reply({ embeds: [errorEmbed(`Vous n'avez que ${money} ${this.bot.config.twitch.monnaie.symbol} !`)], ephemeral: true, });
                this.setMoney(interaction.user.id, amount);
                this.refreshMsg();
                await interaction.reply({ content: `Monnaie mis à jour`, ephemeral: true, });
                break;
            };
        };
    };
};

module.exports = Trade;

function getUsername(bot, userId) {
    const user = bot.users.cache.get(userId);
    if (user) return user.username;
    else return userId;
}