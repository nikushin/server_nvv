const TelegramBot = require('node-telegram-bot-api');

const token = require('./telegram-token');

const bot = new TelegramBot(token, { polling: true });

bot.onText(/(.+)/, (msg, match) => {
    console.log(match[1]);
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Ответ')
    //bot.sendPoll(chatId, 'Включить насос?', ['Да', 'Нет'])
});