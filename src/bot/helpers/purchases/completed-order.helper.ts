import {Conversation} from '@grammyjs/conversations';
import {MyContext} from '../../common/types/session-context';
import {getCompletedOrders} from '../../services/orders.service'; // SAP API bilan bog'langan funktsiya
import {InlineKeyboard} from 'grammy';
import {LanguageEnum} from "../../common/enums/language.enum";
import {Purchases_ru, Purchases_uz} from "../../common/enums/purchases.enum";
import {ConversationStepsEnum} from "../../common/enums/conversation-steps.enum";
import {handleCreatingPurchase} from "./creating-order.helper";
import {handlePendingOrders} from "./pending-orders.helper";
import {purchaseMenu} from "../../controllers/purchases-menu";
import {handleInTransitOrders} from "./intransit-order.helper";
import {Back} from "../../common/enums/inline-menu-enums";
import {handleMainMenu} from "../../controllers/main-menu";
import {handleConfirmedOrders} from "./confirmed-orders.helper";
import {User} from "../../models/user.schema";


function paginate(orders: any, page = 1, perPage = 10) {
    const start = (page - 1) * perPage;  // Sahifa boshlanish indeksini hisoblash
    const end = start + perPage;         // Sahifa tugash indeksini hisoblash
    return orders.slice(start, end);     // Belgilangan bo'limdagi buyurtmalarni ajratib olish
}


function filterOrdersByDate(orders: any, startDate: Date, endDate: Date) {
    console.log("FilterOrders", startDate, endDate);
    const sortedOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.DocDate);
        return orderDate >= startDate && orderDate <= endDate;
    });
    return sortedOrders;
}


export async function handleCompletedOrders(conversation: Conversation<MyContext>, ctx: MyContext) {
    let page = 1;
    const perPage = 10;
    let filteredOrders;
    let messageId: number | undefined;
    let user = await User.findOne({telegramId: ctx!.from!.id});
    let completedOrders;

    // Function to send paginated orders
    const sendOrders = async (filteredOrders: any, page: number, messageId?: number) => {
        const paginatedOrders = paginate(filteredOrders, page, perPage);
        const ordersText = paginatedOrders
            .map((order: any, idx: any) => `${idx + 1}. CardCode: ${order.CardCode}, DocDate: ${order.DocDate}`)
            .join('\n');

        const inlineKeyboard = new InlineKeyboard()
            .text('Orqaga', `prev_page_${page}`)
            .text('Oldinga', `next_page_${page}`);

        if (messageId) {
            await ctx.api.editMessageText(ctx.chat!.id, messageId, ordersText, {
                reply_markup: inlineKeyboard
            });
        } else {
            const message = await ctx.reply(ordersText, {
                reply_markup: inlineKeyboard
            });
            return message.message_id;
        }
    };

    // Function to handle date selection and filter orders
    const handleDateSelection = async () => {
        await ctx.reply('Iltimos, bir kunlik, bir haftalik yoki bir oylik ma\'lumotni tanlang:', {
            reply_markup: new InlineKeyboard()
                .text('Bir kunlik', 'one_day')
                .text('Bir haftalik', 'one_week')
                .text('Bir oylik', 'one_month')
        });

        // Waiting for date selection
        const response = await conversation.waitFor('callback_query:data');
        console.log("Received callback data:", response.callbackQuery?.data); // For debugging

        await ctx.reply(ctx.session.language === LanguageEnum.uz ? 'Kuting, ma\'lumotlar yuklanmoqda...' : 'Пожалуйста, подождите, данные загружаются...');

        // Fetching the completed orders
        completedOrders = await getCompletedOrders();
        if (!completedOrders && !completedOrders.length) {
            await ctx.reply(
                ctx.session.language === LanguageEnum.uz
                    ? "Sizda tugatilgan buyurtmalar yo'q."
                    : "У вас нет подтвержденных заказов."
            );
            return;
        }

        // Determine date range based on user selection
        const today = new Date();
        let startDate: Date = new Date(), endDate: Date = new Date();
        if (response.callbackQuery?.data === 'one_day') {
            startDate.setDate(today.getDate() - 1);
        } else if (response.callbackQuery?.data === 'one_week') {
            startDate.setDate(today.getDate() - 7);
        } else if (response.callbackQuery?.data === 'one_month') {
            startDate.setMonth(today.getMonth() - 1);
        }
        endDate = today;

        // Filter the orders based on the selected date range
        filteredOrders = filterOrdersByDate(completedOrders.value, startDate, endDate);
        console.log("Filtered orders:", filteredOrders); // For debugging
        if (!filteredOrders.length) {
            await ctx.reply(
                ctx.session.language === LanguageEnum.uz
                    ? "Bu kunlar oraliqida tugallangan buyurtmalar mavjud emas."
                    : "В эти дни нет выполненных заказов."
            );
            return;
        }

        // Reset the pagination and send the first page of results
        page = 1;
        messageId = await sendOrders(filteredOrders, page);
    };

    // First run: handle date selection
    await handleDateSelection();

    // Main loop for handling pagination and user responses
    while (true) {
        const nextResponse = await conversation.waitFor(['callback_query:data', 'message:text']);
        if (nextResponse.callbackQuery) {
            const callbackData = nextResponse.callbackQuery.data;
            if (callbackData.startsWith('prev_page_')) {
                page = Math.max(1, page - 1);
                await sendOrders(filteredOrders, page, messageId);
            } else if (callbackData.startsWith('next_page_')) {
                page += 1;
                await sendOrders(filteredOrders, page, messageId);
            } else if (['one_day', 'one_week', 'one_month'].includes(callbackData)) {
                const today = new Date();
                let startDate: Date = new Date(), endDate: Date = new Date();
                if (callbackData === 'one_day') {
                    startDate.setDate(today.getDate() - 1);
                } else if (callbackData === 'one_week') {
                    startDate.setDate(today.getDate() - 7);
                } else if (callbackData === 'one_month') {
                    startDate.setMonth(today.getMonth() - 1);
                }
                endDate = today;

                // Filter the orders based on the selected date range
                filteredOrders = filterOrdersByDate(completedOrders!.value, startDate, endDate);
                console.log("Filtered orders:", filteredOrders); // For debugging
                if (!filteredOrders.length) {
                    await ctx.reply(
                        ctx.session.language === LanguageEnum.uz
                            ? "Bu kunlar oraliqida tugallangan buyurtmalar mavjud emas."
                            : "В эти дни нет выполненных заказов."
                    );
                    return;
                }
                page = 1;
                messageId = await sendOrders(filteredOrders, page);
            }
        } else if (nextResponse.message?.text) {
            const selectedOption = nextResponse.message?.text;
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
                        await purchaseMenu(conversation, ctx, user!.role);
                        break;
                    case Purchases_uz.IN_WAY_ORDERS:
                        ctx.session.currentStep = ConversationStepsEnum.IN_TRANSIT_ORDERS
                        await handleInTransitOrders(conversation, ctx);
                        await purchaseMenu(conversation, ctx, user!.role);
                        break;
                    case Purchases_uz.COMPLETED_ORDERS:
                        ctx.session.currentStep = ConversationStepsEnum.COMPLETED_ORDERS
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
    }
}
