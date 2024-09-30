import {Bot, session} from 'grammy';
import {conversations, createConversation} from '@grammyjs/conversations';

import {config} from 'dotenv';
import {MyContext} from "./bot/common/types/session-context";
import dbConnection from "./bot/common/db/db";
import {ConversationStepsEnum} from "./bot/common/enums/conversation-steps.enum";
import {multiStepConversation} from "./bot/controllers";

config();
const bot = new Bot<MyContext>(process.env.TELEGRAM_BOT_TOKEN as string);
//
const initialData = ConversationStepsEnum.LANGUAGE_SELECTION
bot.use(session({ initial: () => ({ language: "uz", currentStep: initialData  as string  }) }));

bot.use(conversations());
bot.use(createConversation(multiStepConversation));


bot.command('start', async (ctx: MyContext) => {
    console.log('Start command received');
    await ctx.conversation.enter('multiStepConversation');
});

dbConnection
    .then(() => {
        console.log('Database Connected ...');

        bot.api.setMyCommands([
            {
                command: 'start',
                description: 'Botni ishga tushirish'
            }
        ])

        bot.start();
        console.log('Bot started ...')
    })
    .catch(() => {
        console.error('Failed to connect to the database!');
    });

