const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { cartes, rarity } = require('../../storage/cartes.js');
const e = require('../../storage/emojis.js');

class Inventory {
    constructor(bot, userId) {
        this.bot = bot;
        this.userId = userId;
        this.data = {};
    };

    async init() {
        this.data.cards = await this.bot.db.getCards(this.userId);
    }

    isEmpty() {
        return Object.keys(this.data.cards).length == 0
    };
    getData() {
        return this.data;
    }

    getButtons(actuel, last, userId) {
        return [
            new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(e.full_previous)
                    .setCustomId(`inventory_page_0_${userId}_first`)
                    .setDisabled(actuel == 0)
                )
                .addComponents(new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(e.previous)
                    .setCustomId(`inventory_page_${parseInt(actuel) - 1}_${userId}_prev`)
                    .setDisabled(actuel == 0)
                )
                .addComponents(new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`${parseInt(actuel) + 1} / ${parseInt(last) + 1}`)
                    .setCustomId(`inventory_page_selector_${userId}_${last}`)
                )
                .addComponents(new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(e.next)
                    .setCustomId(`inventory_page_${parseInt(actuel) + 1}_${userId}_next`)
                    .setDisabled(last == actuel)
                )
                .addComponents(new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(e.full_next)
                    .setCustomId(`inventory_page_${last}_${userId}_last`)
                    .setDisabled(last == actuel)
                ),
        ];
    };

    getPage(userId, page) {
        const list = Object.keys(this.data.cards).sort((a, b) => a - b);
        const cardData = this.bot.cards.getCardData(list[page])

        const user = this.bot.users.cache.get(userId);
        
        const embed = new EmbedBuilder()
            .setColor(cardData.rarityColor)
            .setTitle(`#${cardData.id} ${cardData.name} [${cardData.rarityName}]`)
            .setImage(this.bot.config.cards_img_link.replace('{name}', cardData.name.toLowerCase()).replace('{rarity}', cardData.rarity))
            .setFooter({ text: `Vous avez ${this.data.cards[cardData.id] || 0} exemplaire${this.data.cards[cardData.id] > 1 ? 's' : ''} sur les ${cardData.max} maximum` })

        if (user) embed.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() });

        return {
            embeds: [embed],
            components: this.getButtons(page, Object.keys(this.data.cards).length-1, userId)
        }
    };

    idToPage(id) {
        const list = Object.keys(this.data.cards).sort((a, b) => a - b);
        return list.indexOf(`${id}`);
    };

};

module.exports = Inventory;