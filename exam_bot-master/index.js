'use strict';

const { start } = require('./schedulesParser.js');
const Telegraf = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN || '617877888:AAE1-4RS-NnuKwcWXHTnEskUOal90OZziEM';

const bot = new Telegraf(BOT_TOKEN, { webhookReply: false } );

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Print in your group name to get your schedule'));
bot.hears(/^[А-ЯІа-яі]{2}-[1-9а-яі]{2,5}$/, (ctx) => start(ctx.message.text)
    .then(result => {
        let allWeekText = '';
        for (const week in result) {
            // eslint-disable-next-line no-useless-concat
            allWeekText += week + ':\n\n';
            allWeekText += '++++++++++++++++++++++++++++++++\n\n';
            for (const day in result[week]) {
                allWeekText += '\t\t\t' + day + ':\n\n';
                for (const time in result[week][day]) {
                    allWeekText += '\t\t\t\t\t\t' + time + ': ' +
                        result[week][day][time] + '\n\n';
                }
                allWeekText += '\n\n';
            }
            allWeekText += '-------------------------------\n\n';
        }

        const split = allWeekText.split('-------------------------------\n\n');
        ctx.reply(split[0]);
        ctx.reply(split[1]);
    })
    .catch(() => ctx.reply('We can`t find this schedule :(')));


bot.telegram.setWebhook('https://scrapper.kostyniukoles.now.sh');
//bot.launch();
//bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);

module.exports = bot.webhookCallback('/');
