import {Bot, GrammyError, HttpError, session} from 'grammy';
import {conversations, createConversation} from '@grammyjs/conversations';

// Dotenv config
import {config} from 'dotenv';

// Types
import {MyContext} from "./bot/common/types/session-context";


// Connecting to database
import dbConnection from "./bot/common/db/db";

// Enums
import {ConversationStepsEnum} from "./bot/common/enums/conversation-steps.enum";

// Controller
import {handleStart} from "./bot/controllers/language-selection";

config();

const bot = new Bot<MyContext>(process.env.TELEGRAM_BOT_TOKEN as string);
//
const initialData = ConversationStepsEnum.LANGUAGE_SELECTION;

// Controlling session storage
bot.use(session({ initial: () => ({ language: 'uz', currentStep: initialData  as string}) }));

bot.use(conversations());
bot.use(createConversation(handleStart));


// Bot runs here
bot.command('start', async (ctx) => {
    console.log(ctx.from?.id)
    await ctx.conversation.enter('handleStart');
});


// Starting bot
const startBot = async () => {
    try {
        // Connecting to database
        await dbConnection;
        console.log('Database Connected ...');
        await bot.api.setMyCommands([
            {
                command: 'start',
                description: 'Botni ishga tushirish'
            }
        ]);
        console.log('Bot started ...');
        await bot.start();
    } catch (error:any) {
        console.error('Error occurred:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
};

startBot();

// Catching errors
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

