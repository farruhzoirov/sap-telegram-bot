import {Conversation} from '@grammyjs/conversations';
import {Keyboard} from "grammy";

// Translates
import {translates} from '../translates/translate';

// Services
import {verifyPhoneNumberService} from '../services/verify-phone-number.service';
// Main context
import {MyContext} from '../common/types/session-context';

// Enums
import {LanguageEnum} from "../common/enums/language.enum";
import {ConversationStepsEnum} from "../common/enums/conversation-steps.enum";

// Main menu
import {handleMainMenu} from "./main-menu";


export async function handlePhoneVerification(conversation: Conversation<MyContext>, ctx: MyContext,): Promise<any> {
    try {
        const keyboard = new Keyboard()
            .requestContact(ctx.session.language === LanguageEnum.uz ? translates.uz.share_phone : translates.ru.share_phone)
            .resized();
        await ctx.reply(
            ctx.session.language === LanguageEnum.uz ? translates.uz.asking_phone : translates.ru.asking_phone,
            {reply_markup: keyboard}
        );
        const {message} = await conversation.waitFor('message:contact');

        // Waiting message
        await ctx.reply(ctx.session.language === 'uz' ? 'Telefon raqamingiz tekshirilmoqda ...' : 'Проверяю номер телефона......');
        let userPhone = message.contact?.phone_number;
        if (!userPhone) {
            throw new Error('Phone number not provided');
        }
        if (!userPhone.startsWith('+')) {
            userPhone = `+${userPhone}`;
        }
        const user = await verifyPhoneNumberService(userPhone, ctx.from?.id);
        if (!user) {
            await ctx.reply(
                ctx.session.language === 'uz' ? translates['uz'].replying_auth_bad : translates['ru'].replying_auth_bad
            );
            await handlePhoneVerification(conversation, ctx);
        }
        await ctx.reply(
            ctx.session.language === 'uz' ? translates['uz'].replying_auth_success : translates['ru'].replying_auth_success
        );
        ctx.session.currentStep = ConversationStepsEnum.MAIN_MENU;
        await handleMainMenu(conversation, ctx);
    } catch
        (error) {
        console.error('Error verifying phone number:', error);
        await ctx.reply(
            ctx.session.language === 'uz' ? translates['uz'].error_occurred : translates['ru'].error_occurred
        );
        return null;
    }
}