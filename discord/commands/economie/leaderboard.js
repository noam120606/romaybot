const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const e = require("../../../storage/emojis.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Donne le classement des utilisateurs"),
    
    async run(bot, interaction) {

        const boardData = await bot.db.getLeaderboard();

        let desc = "";
        for (let i = 0; i < 10; i++) {
            const twitchUsername = await bot.db.getUsername(boardData[i].user);
            const discordId = getByValue(bot.links, boardData[i].user);
            desc += `${e.top[i]} ${twitchUsername} ${boardData[i].monnaie} ${bot.config.twitch.monnaie.symbol} ${discordId?`(<@${discordId}>)`:''}\n`.replaceAll('_', '\\_');
        }

        const twitchId = bot.links.get(interaction.user.id);
        const position = boardData.findIndex(x => x.user == twitchId);
        if (twitchId) {
            if (position > 9) desc += `\n> <@${boardData[position].user}> ${boardData[position].monnaie} ${bot.config.twitch.monnaie.symbol}`;
        }

        const embed = new EmbedBuilder()
            .setTitle("Classement des utilisateurs")
            .setColor("#ffffff")
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(desc);
        if (twitchId) embed.setFooter({ text: `Votre position : ${position+1} / ${boardData.length}` })

        await interaction.reply({ embeds: [embed] });
        
    },
};

function getByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    }
}