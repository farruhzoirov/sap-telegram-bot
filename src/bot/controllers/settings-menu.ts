import { Conversation } from '@grammyjs/conversations';
import { MyContext } from '../common/types/session-context';
import { Keyboard } from 'grammy';
import { User } from '../models/user.schema';
import { translates } from '../translates/translate';
import { handleMainMenu } from '../controllers/main-menu';


// ------------------ // I can't add this to bot it was not added to production yet // ------------------ //

export async function handleUserSettings(conversation: Conversation<MyContext>, ctx: MyContext) {
    const user = await User.findOne({ telegramId: ctx.from?.id });

    if (!user) {
        await ctx.reply(ctx.session.language === 'uz' ? translates['uz'].user_not_found : translates['ru'].user_not_found);
        return;
    }

    let isRunning = true;

    while (isRunning) {
        const keyboard = new Keyboard()
            .text(ctx.session.language === 'uz' ? 'Tilni o\'zgartirish' : 'Изменить язык')
            .row()
            .text(ctx.session.language === 'uz' ? 'Orqaga' : 'Назад');

        await ctx.reply(ctx.session.language === 'uz' ? translates['uz'].settings_menu : translates['ru'].settings_menu, {
            reply_markup: keyboard
        });

        const response = await conversation.waitFor('message:text');
        const choice = response.message.text;

        console.log('User choice:', choice);

        if (choice === (ctx.session.language === 'uz' ? "Tilni o'zgartirish" : "Изменить язык")) {
            // Change the language
            ctx.session.language = ctx.session.language === 'uz' ? 'ru' : 'uz';

            // Provide feedback about the language change
            await ctx.reply(ctx.session.language === 'uz' ? translates['uz'].language_changed : translates['ru'].language_changed);
        }
        else if (choice === (ctx.session.language === 'uz' ? 'Orqaga' : 'Назад')) {
            console.log('User pressed back');
            isRunning = false;
        }
        else {
            console.log('Invalid choice');
        }
    }
    await handleMainMenu(conversation, ctx);
}


