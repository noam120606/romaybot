const { createConnection } = require('mysql');

class Database {
    constructor(bot) {

        this.bot = bot;

        if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_NAME) throw new Error('Database host is not set.');
        this.connection = createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT ?? 3306,
        });

        setInterval(() => {
            this.connection.query('SELECT 1;');
        }, 6 * 60 * 60 * 1000);

        this.connection.connect();
    }

    getRaw() { return this.connection; };

    // GESTION MONNAIE

    async getMonnaie(userId, discord=false) {
        if (discord) userId = this.bot.links.get(userId);
        const res = await this.query('SELECT * FROM monnaie WHERE user = ?;', [userId]);
        if (!res) return null;
        return parseInt(res[0].monnaie);
    };
    async setMonnaie(userId, monnaie, discord=false) {
        const current = await this.getMonnaie(userId, discord);
        if (discord) userId = this.bot.links.get(userId);
        if (discord && !current) return false;
        if (!current) {
            await this.query('INSERT INTO monnaie VALUES (?, ?);', [userId, 0]);
        }
        await this.query('UPDATE monnaie SET monnaie = ? WHERE user = ?;', [monnaie, userId]);
        return current;
    };
    async addMonnaie(userId, monnaie, discord=false) {
        const current = await this.getMonnaie(userId, discord);
        if (discord) userId = this.bot.links.get(userId);
        if (discord && !current) return false;
        if (!current) {
            await this.query('INSERT INTO monnaie VALUES (?, ?);', [userId, 0]);
        }
        await this.query('UPDATE monnaie SET monnaie = ? WHERE user = ?;', [parseInt(monnaie) + current, userId]);
        return current;
    }
    async removeMonnaie(userId, monnaie, discord=false) {
        return await this.addMonnaie(userId, -monnaie, discord);
    }
    async getLeaderboard() {
        return await this.query('SELECT * FROM monnaie ORDER BY CAST(monnaie AS UNSIGNED) DESC;');
    };
    async getMonnaieData() {
        return await this.query('SELECT * FROM monnaie;');
    };

    // GESTION CARTES
    async getDropableCards(arrayOfIds, maxAmount) {
        const allCards = await this.query(`WITH RECURSIVE numbers AS (SELECT 0 AS num UNION ALL SELECT num + 1 FROM numbers WHERE num < ${this.bot.config.card_max}) SELECT n.num AS card, COALESCE(SUM(CAST(c.quantity AS UNSIGNED)), 0) AS total_quantity FROM numbers n LEFT JOIN cards c ON n.num = c.card WHERE n.num IN (${arrayOfIds}) GROUP BY n.num HAVING total_quantity < ?;`, [maxAmount]);
        if (!allCards) return [];
        return allCards.map(d => (d.card));
    };
    async getCards(userId, id=undefined) {
        if (id !== undefined) {
            const curent = await this.query('SELECT * FROM cards WHERE user = ? AND card = ?;', [userId, id]);
            if (!curent) {
                await this.query('INSERT INTO cards VALUES (?, ?, ?);', [userId, id, 0]);
                return 0;
            };
            return parseInt(curent[0].quantity);
        } else {
            let data = await this.query('SELECT * FROM cards WHERE user = ?;', [userId]);
            if (!data) return {};
            data = data.sort((a, b) => b.id - a.id).filter(d => d.quantity > 0);
            const result = {};
            for (let i = 0; i<data.length; i++) result[data[i].card] = data[i].quantity;
            return result;
            // return data.map(d => ({ id: d.card, quantity: d.quantity }));
        };
    };
    async giveCard(userId, id, amount=1) {
        const current = await this.getCards(userId, id);
        await this.query('UPDATE cards SET quantity = ? WHERE user = ? AND card = ?;', [current + amount, userId, id]);
        return current;
    };
    async removeCard(userId, id, amount=1) {
        return await this.giveCard(userId, id, -amount);
    };
    async setCard(userId, id, amount) {
        const current = await this.getCards(userId, id);
        await this.query('UPDATE cards SET quantity = ? WHERE user = ? AND card = ?;', [amount, userId, id]);
        return current;
    };

    // GESTION ID TWITCH
    async setId(userId, username) {
        const data = await this.query('SELECT * FROM identifiants WHERE userid = ?;', [userId]);
        if (!data?.length) return await this.query('INSERT INTO identifiants VALUES (?, ?);', [userId, username]);
        if (data[0].username == username) return;
        return await this.query('UPDATE identifiants SET username = ? WHERE userid = ?;', [username, userId]);
    }
    async getUsername(userId) {
        const data = await this.query('SELECT * FROM identifiants WHERE userid = ?;', [userId]);
        if (!data?.length) return null;
        return data[0].username;
    }
    async getUserData() {
        return await this.query('SELECT * FROM identifiants;');
    }

    // GESTION LIAISION
    async getLinkedByTwitch(twitchId) {
        return await this.query('SELECT * FROM links WHERE twitch = ?;', [twitchId]);
    }
    async getLinkedByDiscord(discordId) {
        return await this.query('SELECT * FROM links WHERE discord = ?;', [discordId]);
    }
    async link(twitchId, discordId) {
        if (await this.getLinkedByTwitch(twitchId)) return false;
        if (await this.getLinkedByDiscord(discordId)) return false;
        this.bot.links.set(discordId, twitchId);
        return await this.query('INSERT INTO links VALUES (?, ?);', [discordId, twitchId]);
    }
    async unlink(discordId) {
        this.bot.links.delete(discordId);
        return await this.query('DELETE FROM links WHERE discord = ?;', [discordId]);
    }
    async getLinks() {
        return await this.query('SELECT * FROM links;');
    }

    async query(sql, params=[]) {
        //this.bot.log(`SQL request completed : \`${sql}\`${params.length ? ` | Params : \`${params.join(', ')}\`` : ''}`);
        return new Promise((resolve, reject) => {
            this.connection.query(sql.replaceAll("'", "''"), params, (err, res) => {
                if (err) return reject(err);
                if (res.length < 1) return resolve(null);
                resolve(res);
            });
        });
    };
}

module.exports = Database;