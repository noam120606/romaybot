const dev = process.env.NODE_ENV === 'development';
const card_max = require('./storage/cartes.js').cartes.length-1;

const production_host = 'romaybot.noam120606.fr';

module.exports = {
    dev,
    card_max,
    cards_img_link: `https://${production_host}/cards_img/{name}/{rarity}.jpg`,
    oauth: {
        loginUrl: `${dev ? "http://localhost:20017" : `https://${production_host}`}/login`,
        twitch: {
            base_uri: `https://id.twitch.tv/oauth2/authorize`,
            client_id: process.env.TWITCH_CLIENTID,
            redirect_uri: `${dev ? "http://localhost:20017" : `https://${production_host}`}/twitch/callback`,
            response_type: 'token',
            scope: "user:read:email",
        },
        discord: {
            base_uri: `https://discord.com/api/oauth2/authorize`,
            exchange_uri: `https://discord.com/api/oauth2/token`,
            client_id: process.env.DISCORD_CLIENTID,
            client_secret: process.env.DISCORD_SECRET,
            redirect_uri: `${dev ? "http%3A%2F%2Flocalhost%3A20017" : `https%3A%2F%2F${production_host}`}%2Fdiscord%2Fcallback`,
            response_type: 'code',
            scope: "identify",
        },
    },
    discord: {
        owners: ['666302273135181824', '457926967661035522', '839129398036267031'],
        stats_save_channel: "1313243164546699355",
    },
    twitch: {
        prefix: '!',
        channels: ['romaykos'],
        channel: '#romaykos',
        owners: ['romaykos', 'noam120606'],
        monnaie: {
            default: 500,
            name: 'Monnaie',
            symbol: '💰',
            tiers: ["Fer", "Or", "Diamant", "Rubis"],
            tiers_colors: ["#4c4c4c", "#f7ba0a", "#d0ffff", "#c90b18"],
            tiers_prices: [1000, 5000, 15000, 25000],
            booster_link: `https://${production_host}/booster_imgs/{level}.jpg`,
            probabilities_de_drop: {
                1: [79.899325, 10, 8, 2, 0.1, 0.00025, 0.0002, 0.000125, 0.0001], // Tier 1
                2: [64.4943, 16, 13, 6, 0.5, 0.0025, 0.002, 0.001, 0.0002], // Tier 2
                3: [48.944, 21, 19, 10, 1, 0.025, 0.02, 0.01, 0.001], // Tier 3
                4: [27.44, 30, 26, 14, 2, 0.25, 0.2, 0.1, 0.01], // Tier 4
            },
        },
    }
}