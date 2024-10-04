import {Conversation} from '@grammyjs/conversations';
import {MyContext} from '../common/types/session-context';
import {Keyboard} from 'grammy';
import {User} from '../models/user.schema';
import {translates} from '../translates/translate';
import {askingPhone} from './asking-phone';
import {validatePhone} from './validate-phone';
import {verifyPhoneNumberService} from '../services/verify-phone-number.service';

export async function handleUserSettings(conversation: Conversation<MyContext>, ctx: MyContext) {
    const user = await User.findOne({telegramId: ctx.from?.id});

    if (!user) {
        await ctx.reply(ctx.session.language === 'uz' ? translates['uz'].user_not_found : translates['ru'].user_not_found);
        return;
    }
    const keyboard = new Keyboard()
        .text(ctx.session.language === 'uz' ? 'Tilni o\'zgartirish' : 'Изменить язык')
        .text(ctx.session.language === 'uz' ? 'Telefon raqamni o\'zgartirish' : 'Изменить номер телефона')
        .row()
        .text(ctx.session.language === 'uz' ? 'Orqaga' : 'Назад');

    await ctx.reply(
        ctx.session.language === 'uz' ? translates['uz'].settings_menu : translates['ru'].settings_menu,
        {reply_markup: keyboard}
    );

    const response = await conversation.waitFor('message:text');
    const choice = response.message.text;

    if (choice === (ctx.session.language === 'uz' ? 'Tilni o\'zgartirish' : 'Изменить язык')) {
        ctx.session.language = ctx.session.language === 'uz' ? 'ru' : 'uz';
        await ctx.reply(ctx.session.language === 'uz' ? translates['uz'].language_changed : translates['ru'].language_changed);
    } else if (choice === (ctx.session.language === 'uz' ? 'Telefon raqamni o\'zgartirish' : 'Изменить номер телефона')) {
        let newPhone = await askingPhone(conversation, ctx, ctx.session.language);
        const isValid = await validatePhone(conversation, ctx, ctx.session.language, newPhone);

        if (isValid) {
            const updatedUser = await verifyPhoneNumberService(newPhone, ctx.from?.id);
            if (updatedUser) {
                await ctx.reply(ctx.session.language === 'uz' ? translates['uz'].phone_updated : translates['ru'].phone_updated);
            } else {
                await ctx.reply(ctx.session.language === 'uz' ? translates['uz'].phone_update_failed : translates['ru'].phone_update_failed);
            }
        }
    }
}