require('dotenv').config({ path: './.env' });

const Bot = require('./structure/client/Bot.js');
const client = new Bot();

client.start();


//nodejs-events
process.on("unhandledRejection", error);
process.on("uncaughtException", error);
process.on("uncaughtExceptionMonitor", error);
function error(err) {
    try { client.log(err, 'error') }
    catch { console.error(err) }
}