const express = require('express');
const session = require('express-session');
const { cartes, rarity } = require('../../storage/cartes.js');
const maj = require('../../functions/maj.js');

class Webserver {
    constructor(bot, options = {}) {
        this.app = express();
        this.app.use(session({
            secret: options.session_secret || process.env.SESSION_SECRET || 'secret',
            resave: false,
            saveUninitialized: true 
        }));
        this.app.set('view engine', 'ejs');
        this.port = options.port || process.env.WEB_PORT || 8080;
        this.bot = bot;
    }

    loadRoutes() {
        this.app.use(express.static('public'));

        this.loadWeb();
        this.loadCallbacks();
    }

    loadWeb() {
        const cardsNames = [];
        for (let i = 0; i < cartes.length; i++) {
            if (!cardsNames.includes(cartes[i].name)) cardsNames.push(cartes[i].name);
        }
        this.app.get('/', (req, res) => {
            res.render('card-list', {
                cards: cardsNames,
                link: this.bot.config.cards_img_link,
            });
        });
        this.app.get('/details/:name', (req, res) => {
            const cards = cartes.filter(c => c.name.toLowerCase() === req.params.name.toLowerCase());
            const rarityAvailable = cards.map(c => rarity[c.rarity]);
            res.render('card-details', {
                name: maj(cards[0].name.toLowerCase()),
                rarity: rarityAvailable,
                link: this.bot.config.cards_img_link,
            });
        });
    }

    loadCallbacks() {
        const { twitch, discord } = this.bot.config.oauth;
        this.app.get('/login', async (req, res) => {
            const reconnect = req.query.reconnect === 'true' ? true : false;
            if (reconnect) {
                req.session.twitchId = null;
                req.session.discordId = null;
            }
            if (!req.session.twitchId) return res.redirect(`${twitch.base_uri}?client_id=${twitch.client_id}&redirect_uri=${twitch.redirect_uri}&response_type=${twitch.response_type}&scope=${twitch.scope}`);
            if (!req.session.discordId) return res.redirect(`${discord.base_uri}?client_id=${discord.client_id}&redirect_uri=${discord.redirect_uri}&response_type=${discord.response_type}&scope=${discord.scope}`);
            await this.bot.db.link(req.session.twitchId, req.session.discordId);
            return res.redirect('/');
        });

        this.app.get('/twitch/callback', async (req, res) => {
            return res.send(`<script>
                const fragment = window.location.hash.substring(1);
                const params = new URLSearchParams(fragment);
                const accessToken = params.get('access_token');
                if (!accessToken) window.location = '/login';
                else window.location = \`/twitch/get-token?access_token=\${accessToken}\`;
            </script>`);
        })
        this.app.get('/twitch/get-token', async (req, res) => {
            const { access_token } = req.query;
            if (!access_token) return res.redirect('/login');
            const reponse = await fetch(`https://api.twitch.tv/helix/users`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Client-Id': twitch.client_id,
                } 
            });
            const data = await reponse.json();
            const twitchId = data?.data[0]?.id;
            req.session.twitchId = twitchId;
            res.redirect('/login');
        });

        this.app.get('/discord/callback', async (req, res) => {
            const { code } = req.query;
            const reponse = await fetch(discord.exchange_uri, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `client_id=${discord.client_id}&client_secret=${discord.client_secret}&grant_type=authorization_code&code=${code}&redirect_uri=${discord.redirect_uri}`
            });
            const data = await reponse.json();
            const user_response = await fetch(`https://discord.com/api/users/@me`, {
                headers: { Authorization: `Bearer ${data.access_token}` }
            });
            const user_data = await user_response.json();
            const discordId = user_data.id;
            req.session.discordId = discordId;
            res.redirect('/login');
        });
    }

    start() {
        this.app.listen(this.port, () => {
            this.bot.log(`Webserver started on port ${this.port}`, 'ready');
        });
        this.loadRoutes();
    }
}

module.exports = Webserver;