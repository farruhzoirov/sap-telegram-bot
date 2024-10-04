import {Bot, GrammyError, HttpError, session} from 'grammy';
import {conversations, createConversation} from '@grammyjs/conversations';

import {config} from 'dotenv';

import {MyContext} from "./bot/common/types/session-context";

import dbConnection from "./bot/common/db/db";

import {ConversationStepsEnum} from "./bot/common/enums/conversation-steps.enum";

import {handleStart} from "./bot/controllers/language-selection";

config();
const bot = new Bot<MyContext>(process.env.TELEGRAM_BOT_TOKEN as string);
//
const initialData = ConversationStepsEnum.LANGUAGE_SELECTION
bot.use(session({ initial: () => ({ language: 'uz', currentStep: initialData  as string}) }));

bot.use(conversations());
bot.use(createConversation(handleStart));

bot.command('start', async (ctx) => {
    await ctx.conversation.enter('handleStart');
});


const startBot = async () => {
    try {
        await dbConnection;
        console.log('Database Connected ...');
        // Set commands for the bot
        await bot.api.setMyCommands([
            {
                command: 'start',
                description: 'Botni ishga tushirish'
            }
        ]);
        // Start the bot
        await bot.start();
        console.log('Bot started ...');
    } catch (error:any) {
        console.error('Error occurred:', error.message);
        // Additional logging for debugging
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
};

startBot()
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});