const { Events, EmbedBuilder } = require('discord.js');
const getWizebotLeaderboard = require('../../functions/getWizebotLeaderboard.js');
const cron = require('node-cron');

module.exports = {
    name: Events.ClientReady,
    async run(bot) {
        cron.schedule('0 55 23 * * *', async () => {
            const date = new Date();
            if (date.getDate() === (new Date(date.getFullYear(), date.getMonth() + 1, 0)).getDate()) {
                const channelId = bot.config.discord.stats_save_channel;
                const channel = bot.channels.cache.get(channelId);
                if (!channel) return;
                const leaderboard = await getWizebotLeaderboard();
                const embeds = [];
                for (const category in leaderboard) {
                    const data = leaderboard[category];
                    console.log(data);
                    const embed = new EmbedBuilder()
                        .setTitle(`Top 20 ${category.toUpperCase()}`)
                        .setColor("#ffffff")
                        .setDescription(data.slice(0, 20).map((d, i) => `[${i + 1}] ${d.user_name} \`${d.value}\``).join('\n').replaceAll('_', '\\_'));
                    embeds.push(embed);
                }
                await channel.send({ content: `Statistiques du ${new Date().toLocaleDateString()}` ,embeds });
            }
        });
    }
}