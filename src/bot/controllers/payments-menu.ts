import {Conversation} from "@grammyjs/conversations";

// Types
import {MyContext} from "../common/types/session-context";


// Enums
import {LanguageEnum} from "../common/enums/language.enum";
import {ConversationStepsEnum} from "../common/enums/conversation-steps.enum";
import {Back} from "../common/enums/inline-menu-enums";

// Helpers
import {getPaymentsMenuByRole} from "../helpers/buttonsByRole.helper";
import {handleConfirmedOrders} from "../helpers/purchases/confirmed-orders.helper";
import {Payment_ru, Payment_uz} from "../common/enums/payments.enum";
import {handleInDebtCustomer} from "../helpers/payments/in-debt.helper";
import {handleOutputPayment} from "../helpers/payments/output-payment.helper";
import { handleIncomingPayments} from "../helpers/payments/incoming-payment.helper";

// Main Menu
import {handleMainMenu} from "./main-menu";


export async function paymentsMenu(conversation: Conversation<MyContext>, ctx: MyContext, role: string) {
    let keyboard = await getPaymentsMenuByRole(role, ctx.session.language);
    await ctx.reply(
        ctx.session.language === LanguageEnum.uz ? "To'lovlar bo'limi" : 'Раздел платежи',
        {
            reply_markup: {
                keyboard: keyboard!.build(),
                resize_keyboard: true,
            },
        }
    );
    const {message: buttonMessage} = await conversation.waitFor('message:text');
    const selectedOption = buttonMessage!.text;
    if (ctx.session.language === LanguageEnum.uz) {
        switch (selectedOption) {
            case Payment_uz.IN_DEBT:
                await handleInDebtCustomer(conversation, ctx);
                break;
            case Payment_uz.OUTPUT_PAYMENT:
                ctx.session.currentStep = ConversationStepsEnum.CONFIRMED_ORDERS
                await handleConfirmedOrders(conversation, ctx);
                break;
            case Payment_uz.INCOMING_PAYMENT:
                ctx.session.currentStep = ConversationStepsEnum.PENDING_ORDERS
                await handleIncomingPayments(conversation, ctx);
                break;
            case Back.BACK_UZ:
                ctx.session.currentStep = ConversationStepsEnum.MAIN_MENU
                await handleMainMenu(conversation, ctx);
        }
    } else if (ctx.session.language === LanguageEnum.ru) {
        switch (selectedOption) {
            case Payment_ru.IN_DEBT:
                await handleInDebtCustomer(conversation, ctx);
                break;
            case Payment_ru.OUTPUT_PAYMENT:
                await handleOutputPayment(conversation, ctx);
                break;
            case Payment_ru.INCOMING_PAYMENT:
                await handleIncomingPayments(conversation, ctx);
                break;
            case Back.BACK_RU:
                ctx.session.currentStep = ConversationStepsEnum.MAIN_MENU
                await handleMainMenu(conversation, ctx);
        }
    }
}
