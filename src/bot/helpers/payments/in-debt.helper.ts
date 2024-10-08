import {Conversation} from "@grammyjs/conversations";
import {InlineKeyboard} from "grammy";

// Types
import {MyContext} from "../../common/types/session-context";

// Services
import {getInDebtCustomers} from "../../services/payments.service";

// Enums
import {LanguageEnum} from "../../common/enums/language.enum";
import {Payment_ru, Payment_uz} from "../../common/enums/payments.enum";
import {ConversationStepsEnum} from "../../common/enums/conversation-steps.enum";
import {Back} from "../../common/enums/inline-menu-enums";

// Helpers
import {handleConfirmedOrders} from "../purchases/confirmed-orders.helper";
import {handleOutputPayment} from "./output-payment.helper";
import {handleIncomingPayments} from "./incoming-payment.helper";

// Main menu
import {handleMainMenu} from "../../controllers/main-menu";


export async function handleInDebtCustomer(conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> {
    const inDebtCustomers = await getInDebtCustomers();
    if (!inDebtCustomers && !inDebtCustomers.length) {
        await ctx.reply(
            ctx.session.language === 'uz'
                ? "Qarzdorliklar mavjud emas buyurtmalar yo'q."
                : "У вас нет подтвержденных заказов."
        );
        return;
    }

    const pageSize = 10;  // Number of customers per page
    const totalPages = Math.ceil(inDebtCustomers.value.length / pageSize);

    let currentPage = 1;  // Default to the first page

    while (true) {
        // Show the current page of customers
        await showPage(ctx, inDebtCustomers.value, currentPage, totalPages);

        const callback = await conversation.waitFor(["callback_query:data", "message:text"]);

        if (callback.callbackQuery?.data) {
            // Handle pagination buttons
            const callbackData = callback.callbackQuery?.data;
            if (callbackData.startsWith('next_page')) {
                currentPage = Math.min(totalPages, currentPage + 1);
            } else if (callbackData.startsWith('prev_page') && currentPage > 1) {
                currentPage = Math.max(1, currentPage - 1);
            }
        } else if (callback.message?.text) {
            const selectedOption = callback.message?.text;
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
    }

    async function showPage(ctx: MyContext, customers: any[], page: number, totalPages: number): Promise<void> {
        const pageSize = 5;
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, customers.length);

        // Generate the content for the current page
        let responseContent = customers.slice(startIndex, endIndex).map((customer: any, index: any) => {
            return `<b>${startIndex + index + 1})</b> Mijoz ismi: ${customer.CardName},  Qarzdorligi: ${customer.CurrentAccountBalance} ${customer.Currency}`;
        }).join("\n");

        // Pagination buttons
        const keyboard = new InlineKeyboard();
        if (page > 1) keyboard.add({text: '⬅️ Prev', callback_data: `prev_${page}`});
        if (page < totalPages) keyboard.add({text: 'Next ➡️', callback_data: `next_${page}`});

        // Send or update the message with pagination
        await ctx.reply(responseContent, {
            parse_mode: 'HTML',
            reply_markup: keyboard
        });
    }
}
