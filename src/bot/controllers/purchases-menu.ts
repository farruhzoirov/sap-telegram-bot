import {Conversation} from "@grammyjs/conversations";

// Types
import {MyContext} from "../common/types/session-context";
// Enums
import {LanguageEnum} from "../common/enums/language.enum";
import {Back} from "../common/enums/inline-menu-enums";
import {Purchases_uz, Purchases_ru} from "../common/enums/purchases.enum";

// Helpers
import {getPurchasesMenuByRole} from "../helpers/buttonsByRole.helper";


// Import your order handling helpers
import {handlePendingOrders} from "../helpers/purchases/pending-orders.helper";
import {handleCreatingPurchase} from "../helpers/purchases/creating-order.helper";
import {handleInTransitOrders} from "../helpers/purchases/intransit-order.helper";
import {handleConfirmedOrders} from "../helpers/purchases/confirmed-orders.helper";
import {handleCompletedOrders} from "../helpers/purchases/completed-order.helper";
import {ConversationStepsEnum} from "../common/enums/conversation-steps.enum";

const ITEMS_PER_PAGE = 10;
import {User} from "../models/user.schema";
import {handleMainMenu} from "./main-menu";

export async function purchaseMenu(conversation: Conversation<MyContext>, ctx: MyContext, role: string): Promise<any> {
    const keyboard = await getPurchasesMenuByRole(role, ctx.session.language);
    let user = await User.findOne({telegramId: ctx!.from!.id});
    await ctx.reply(
        ctx.session.language === LanguageEnum.uz ? 'Haridlar bo\'limi' : 'Раздел покупок',
        {
            reply_markup: {
                keyboard: keyboard!.build(),
                resize_keyboard: true,
                one_time_keyboard: false,
            },
        }
    );
    const {message: buttonMessage} = await conversation.waitFor('message:text');
    const selectedOption = buttonMessage!.text;
    console.log(selectedOption)
    if (ctx.session.language === LanguageEnum.uz) {
        switch (selectedOption) {
            case Purchases_uz.CREATING_PURCHASE:
                ctx.session.currentStep = ConversationStepsEnum.CREATING_ORDERS;
                await handleCreatingPurchase(conversation, ctx);
                break;
            case Purchases_uz.CONFIRMED_ORDERS:
                ctx.session.currentStep = ConversationStepsEnum.CONFIRMED_ORDERS;
                await handleConfirmedOrders(conversation, ctx);
                break;
            case Purchases_uz.PENDING_ORDERS:
                ctx.session.currentStep = ConversationStepsEnum.PENDING_ORDERS;
                await handlePendingOrders(conversation, ctx);
                break;
            case Purchases_uz.IN_WAY_ORDERS:
                ctx.session.currentStep = ConversationStepsEnum.IN_TRANSIT_ORDERS;
                await handleInTransitOrders(conversation, ctx);
                break;
            case Purchases_uz.COMPLETED_ORDERS:
                ctx.session.currentStep = ConversationStepsEnum.COMPLETED_ORDERS;
                await handleCompletedOrders(conversation, ctx);
                await purchaseMenu(conversation, ctx, user!.role);
                break;
            case Back.BACK_UZ:
                ctx.session.currentStep = ConversationStepsEnum.MAIN_MENU
                await handleMainMenu(conversation, ctx);
        }
    } else if (ctx.session.language === LanguageEnum.ru) {
        switch (selectedOption) {
            case Purchases_ru.CREATING_PURCHASE:
                ctx.session.currentStep = ConversationStepsEnum.CREATING_ORDERS;
                await handleCreatingPurchase(conversation, ctx);
                break;
            case Purchases_ru.CONFIRMED_ORDERS:
                ctx.session.currentStep = ConversationStepsEnum.CONFIRMED_ORDERS
                await handleConfirmedOrders(conversation, ctx);
                break;
            case Purchases_ru.PENDING_ORDERS:
                ctx.session.currentStep = ConversationStepsEnum.PENDING_ORDERS
                await handlePendingOrders(conversation, ctx);
                await purchaseMenu(conversation, ctx, user!.role);
                break;
            case Purchases_ru.IN_WAY_ORDERS:
                ctx.session.currentStep = ConversationStepsEnum.IN_TRANSIT_ORDERS
                await handleInTransitOrders(conversation, ctx);
                await purchaseMenu(conversation, ctx, user!.role);
                break;
            case Purchases_ru.COMPLETED_ORDERS:
                ctx.session.currentStep = ConversationStepsEnum.COMPLETED_ORDERS
                await handleCompletedOrders(conversation, ctx);
                await purchaseMenu(conversation, ctx, user!.role);
                break;
            case Back.BACK_RU:
                ctx.session.currentStep = ConversationStepsEnum.MAIN_MENU
                await handleMainMenu(conversation, ctx);
        }
    }
}
