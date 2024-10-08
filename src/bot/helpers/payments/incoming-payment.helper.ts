import {Conversation} from "@grammyjs/conversations";
import {InlineKeyboard} from "grammy";

// Types
import {MyContext} from "../../common/types/session-context";

// Enums
import {LanguageEnum} from "../../common/enums/language.enum";
import {Payment_ru, Payment_uz} from "../../common/enums/payments.enum";
import {ConversationStepsEnum} from "../../common/enums/conversation-steps.enum";
import {Back} from "../../common/enums/inline-menu-enums";

// Helpers
import {handleConfirmedOrders} from "../purchases/confirmed-orders.helper";

// Main menu
import {handleMainMenu} from "../../controllers/main-menu";

// Helpers
import {handleInDebtCustomer} from "./in-debt.helper";
import {handleOutputPayment} from "./output-payment.helper";


// Services
import {getIncomingPayments} from "../../services/payments.service";


// Helper function to filter by date
function filterPaymentsByDate(items: any, startDate: Date, endDate: Date) {
    const sortedItems = items.filter((order: any) => {
        const askingDate = new Date(order.DocDate);
        return askingDate >= startDate && askingDate <= endDate;
    });
    return sortedItems;
}

// Helper function for pagination
function paginate(orders: any, page = 1, perPage = 10) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return orders.slice(start, end);
}

export async function handleIncomingPayments(conversation: Conversation<MyContext>, ctx: MyContext) {
    try {
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? 'Kuting, ma\'lumotlar yuklanmoqda...' : 'Пожалуйста, подождите, данные загружаются...');
        const inDebtCustomers = await getIncomingPayments();
        if (!inDebtCustomers && !inDebtCustomers.length) {
            await ctx.reply(
                ctx.session.language === LanguageEnum.uz
                    ? "Akt sverka mavjud emas"
                    : "У вас нет подтвержденных заказов."
            );
            return;
        }

        await ctx.reply('Iltimos, bir kunlik, bir haftalik yoki bir oylik ma\'lumotni tanlang:', {
            reply_markup: new InlineKeyboard()
                .text('Bir kunlik', 'one_day')
                .text('Bir haftalik', 'one_week')
                .text('Bir oylik', 'one_month')
        });

        let startDate: Date = new Date(), endDate: Date = new Date();
        const today = new Date();

        while (true) {
            const response = await conversation.waitFor('callback_query:data');
            const data = response.callbackQuery?.data;

            if (data === 'one_day') {
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 1);
                endDate = today;
                await ctx.reply("Bir kunlik ma'lumot tanlandi.");
                break;
            } else if (data === 'one_week') {
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 7);
                endDate = today;
                await ctx.reply("Bir haftalik ma'lumot tanlandi.");
                break;
            } else if (data === 'one_month') {
                startDate = new Date(today);
                startDate.setMonth(today.getMonth() - 1);
                endDate = today;
                await ctx.reply("Bir oylik ma'lumot tanlandi.");
                break;
            } else {
                await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Iltimos, qayta tanlang." : "Пожалуйста, выберите снова.");
            }
        }

        const filteredOrders = filterPaymentsByDate(inDebtCustomers.value, startDate, endDate);
        if (!filteredOrders.length) {
            await ctx.reply(
                ctx.session.language === LanguageEnum.uz ? "Bu kunlar oralig'ida tugallangan buyurtmalar mavjud emas" : "В эти дни нет выполненных заказов"
            );
            return;
        }
        let page = 1;
        const perPage = 10;

        const sendOrders = async (page: number) => {
            const paginatedOrders = paginate(filteredOrders, page, perPage);
            const ordersText = paginatedOrders.map((order: any, idx: any) => `${idx + 1}. CardCode: ${order.CardCode}, DocDate: ${order.DocDate}`).join('\n');

            await ctx.reply(ordersText, {
                reply_markup: new InlineKeyboard()
                    .text('Orqaga', `prev_page_${page}`)
                    .text('Oldinga', `next_page_${page}`)
            });
        };

        await sendOrders(page);
        while (true) {
            const nextResponse = await conversation.waitFor(['callback_query:data', 'message:text']);
            if (nextResponse.callbackQuery?.data) {
                const callbackData = nextResponse.callbackQuery?.data;
                if (callbackData.startsWith('next_page')) {
                    page += 1;
                    await sendOrders(page);
                } else if (callbackData.startsWith('prev_page') && page > 1) {
                    page -= 1;
                    await sendOrders(page);
                }
            } else if (nextResponse.message?.text) {
                const selectedOption = nextResponse.message?.text;
                if (ctx.session.language === LanguageEnum.uz) {
                    switch (selectedOption) {
                        case Payment_uz.IN_DEBT:
                            await handleInDebtCustomer(conversation, ctx);
                            break;
                        case Payment_uz.OUTPUT_PAYMENT:
                            ctx.session.currentStep = ConversationStepsEnum.CONFIRMED_ORDERS;
                            await handleConfirmedOrders(conversation, ctx);
                            break;
                        case Payment_uz.INCOMING_PAYMENT:
                            ctx.session.currentStep = ConversationStepsEnum.PENDING_ORDERS;
                            await handleIncomingPayments(conversation, ctx);
                            break;
                        case Back.BACK_UZ:
                            ctx.session.currentStep = ConversationStepsEnum.MAIN_MENU;
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
                            ctx.session.currentStep = ConversationStepsEnum.MAIN_MENU;
                            await handleMainMenu(conversation, ctx);
                    }
                }
            }
        }
    } catch (error) {
        // Error handling
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? 'Xatolik yuz berdi, keyinroq qayta urinib ko\'ring.' : 'Произошла ошибка, попробуйте позже.');
    }
}
