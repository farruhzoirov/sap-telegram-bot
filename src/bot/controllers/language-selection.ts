import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../common/types/session-context";
import {InlineKeyboard} from "grammy";
import {translates} from "../translates/translate";

export async function handleLanguageSelection(conversation: Conversation<MyContext>, ctx: MyContext): Promise<string> {
    const keyboard = new InlineKeyboard()
        .text('🇺🇿 Oʻzbekcha', 'uzbek')
        .text('🇷🇺 Русский', 'russian');
    await ctx.reply('Tilni tanlang | Выберите язык:', {reply_markup: keyboard});

    const languageChoice = await conversation.waitFor('callback_query:data');
    const chosenLang = languageChoice.callbackQuery?.data;

    const chatId = ctx.chat?.id;
    const messageId = languageChoice.callbackQuery?.message?.message_id;
    if (chatId && messageId) {
        try {
            await ctx.api.deleteMessage(chatId, messageId);
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    }

    if (chosenLang === 'uzbek') {
        ctx.session.language = 'uz';
    } else if (chosenLang === 'russian') {
        ctx.session.language = 'ru';
    }

    if (ctx.callbackQuery?.id) {
        await ctx.answerCallbackQuery();
    }
    return ctx.session.language || 'uz';
}

