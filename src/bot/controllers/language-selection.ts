import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../common/types/session-context";
import {InlineKeyboard} from "grammy";

// Conversation enum
import {ConversationStepsEnum} from "../common/enums/conversation-steps.enum";
import {handlePhoneVerification} from "./phone-verification";

// User schema for mongodb
import {User} from "../models/user.schema";

// Handle Menu
import {handleMainMenu} from "./main-menu";

export async function handleStart(conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> {
    const user = await User.findOne({ telegramId: ctx!.from!.id });
    if (user) {
        ctx.session.currentStep = ConversationStepsEnum.MAIN_MENU;
        await handleMainMenu(conversation, ctx);
        return;
    }
    const keyboard = new InlineKeyboard()
        .text("🇺🇿 Oʻzbekcha", "uzbek")
        .text("🇷🇺 Русский", "russian");
    await ctx.reply("Tilni tanlang | Выберите язык:", {reply_markup: keyboard});

    const languageChoice = await conversation.waitFor("callback_query:data");
    const chosenLang = languageChoice.callbackQuery?.data;

    const chatId = ctx.chat?.id;
    const messageId = languageChoice.callbackQuery?.message?.message_id;
    if (chatId && messageId) {
        try {
            await ctx.api.deleteMessage(chatId, messageId);
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
        if (chosenLang === "uzbek") {
            ctx.session.language = "uz";
        } else if (chosenLang === "russian") {
            ctx.session.language = "ru";
        }

        if (ctx.callbackQuery?.id) {
            await ctx.answerCallbackQuery();
        }
    }

    ctx.session.currentStep = ConversationStepsEnum.PHONE_VERIFICATION;
    await handlePhoneVerification(conversation, ctx);
}
