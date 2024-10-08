import {Conversation} from '@grammyjs/conversations';
import {getInitialButtons} from '../helpers/buttonsByRole.helper';
import {MyContext} from '../common/types/session-context';
import {LanguageEnum} from "../common/enums/language.enum";
import {PaymentMenu, PurchasesMenu, SettingsMenu} from "../common/enums/main-menu.enums";
import {ConversationStepsEnum} from "../common/enums/conversation-steps.enum";
import {purchaseMenu} from "./purchases-menu";
import {User} from "../models/user.schema";
import {paymentsMenu} from "./payments-menu";
import {handleUserSettings} from "./settings-menu";

export async function handleMainMenu(conversation: Conversation<MyContext>, ctx: MyContext) {
    let keyboard = await getInitialButtons(ctx);
    await ctx.reply(
        ctx.session.language === LanguageEnum.uz ? "Asosiy menu" : "Главное меню",
        {
            reply_markup: {
                keyboard: keyboard!.build(),
                resize_keyboard: true,
            },
        }
    );
    const user = await User.findOne({telegramId: ctx!.from!.id});
    const {message: buttonMessage} = await conversation.waitFor('message:text');
    let selectedOption = buttonMessage.text;
    if (ctx.session.language === LanguageEnum.uz) {
        switch (selectedOption) {
            case PurchasesMenu.PURCHASES_UZ:
                ctx.session.currentStep = ConversationStepsEnum.PURCHASES
                await purchaseMenu(conversation, ctx, user!.role!);
                break;
            case PaymentMenu.PAYMENTS_UZ:
                ctx.session.currentStep = ConversationStepsEnum.PAYMENTS
                await paymentsMenu(conversation, ctx, user!.role!);
                break;
            case SettingsMenu.SETTINGS_UZ:
                ctx.session.currentStep = ConversationStepsEnum.SETTINGS
                await handleUserSettings(conversation, ctx);
                break;
        }
    } else if (ctx.session.language === LanguageEnum.ru) {
        switch (selectedOption) {
            case PurchasesMenu.PURCHASES_RU:
                ctx.session.currentStep = ConversationStepsEnum.PURCHASES
                await purchaseMenu(conversation, ctx, user!.role!);
                break;
            case PaymentMenu.PAYMENTS_RU:
                ctx.session.currentStep = ConversationStepsEnum.PAYMENTS
                await paymentsMenu(conversation, ctx, user!.role!);
                break;
            case SettingsMenu.SETTINGS_RU:
                ctx.session.currentStep = ConversationStepsEnum.SETTINGS
                await handleUserSettings(conversation, ctx);
                break;
        }
    }
}