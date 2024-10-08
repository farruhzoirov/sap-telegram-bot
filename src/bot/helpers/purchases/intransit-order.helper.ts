import {Conversation} from "@grammyjs/conversations";
import {InlineKeyboard} from "grammy";


// Services
import { getInWayOrders} from "../../services/orders.service";

// Menus
import {handleMainMenu} from "../../controllers/main-menu";
import {purchaseMenu} from "../../controllers/purchases-menu";

// User model for mongodb
import {User} from "../../models/user.schema";

// Enums
import {ConversationStepsEnum} from "../../common/enums/conversation-steps.enum";
import {LanguageEnum} from "../../common/enums/language.enum";
import {Purchases_ru, Purchases_uz} from "../../common/enums/purchases.enum";
import {Back} from "../../common/enums/inline-menu-enums";

// Helpers
import {handleCreatingPurchase} from "./creating-order.helper";
import {handleConfirmedOrders} from "./confirmed-orders.helper";
import {handlePendingOrders} from "./pending-orders.helper";
import {handleCompletedOrders} from "./completed-order.helper";

// Types
import {MyContext} from "../../common/types/session-context";

const ITEMS_PER_PAGE = 10;

interface DocumentLine {
    ItemCode: string;
    Quantity: number;
    UnitPrice: number;
    Currency: string;
}

interface Order {
    DocumentLines: DocumentLine[];
}

interface PendingOrdersResponse {
    value: Order[];
}

export async function handleInTransitOrders(conversation: Conversation<MyContext>, ctx: MyContext) {
    await ctx.reply(ctx.session.language === 'uz' ? 'Kuting, ma\'lumotlar yuklanmoqda...' : 'Пожалуйста, подождите, данные загружаются...');

    const confirmedOrders: PendingOrdersResponse = await getInWayOrders();
    let user = await User.findOne({telegramId: ctx!.from!.id});
    if (!confirmedOrders || !confirmedOrders.value.length) {
        await ctx.reply(
            ctx.session.language === 'uz'
                ? "Sizda yo'ldagi buyurtmalar yo'q."
                : "У вас нет подтвержденных заказов."
        );
        ctx.session.currentStep = ConversationStepsEnum.PURCHASES;
        await purchaseMenu(conversation, ctx, user!.role);
        return;
    }

    let currentPage = 1;
    const totalPages = Math.ceil(confirmedOrders.value.length / ITEMS_PER_PAGE);

    const showPage = (page: number): { message: string; keyboard: InlineKeyboard } => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageOrders = confirmedOrders.value.slice(start, end);

        const items = pageOrders.map((order) => {
            return order.DocumentLines.map((line, index) => {
                const quantity = line.Quantity;
                const price = line.UnitPrice || 0;
                const currency = line.Currency || '';
                return `${index + 1}) ${line.ItemCode} (Qty: ${quantity}, Price: ${price}${currency}) \n`;
            }).join('\n');
        }).join('\n');

        const message = ctx.session.language === 'uz'
            ? `<b>Yo'ldagi buyurtmalar (Sahifa ${page}/${totalPages})</b>\n${items}`
            : `<b>Заказы в пути (Страница ${page}/${totalPages})</b>\n${items}`;

        const keyboard = new InlineKeyboard();
        if (page > 1) keyboard.add({text: '⬅️ Prev', callback_data: `prev_${page}`});
        if (page < totalPages) keyboard.add({text: 'Next ➡️', callback_data: `next_${page}`});

        return {message, keyboard};
    };
    const sendOrEditMessage = async (page: number, messageId?: number) => {
        const {message, keyboard} = showPage(page);
        try {
            if (messageId) {
                await ctx.api.editMessageText(ctx.chat!.id, messageId, message, {
                    parse_mode: "HTML",
                    reply_markup: keyboard
                });
            } else {
                await ctx.reply(message, {parse_mode: "HTML", reply_markup: keyboard});
            }
        } catch (error) {
            console.error('Error sending/editing message:', error);
            await ctx.reply(message, {parse_mode: "HTML", reply_markup: keyboard});
        }
    };

    await sendOrEditMessage(currentPage);

    while (true) {
        const response = await conversation.waitFor(['callback_query:data', 'message:text']);
        if (response.callbackQuery?.data) {
            const data = response.callbackQuery.data;
            if (data.startsWith('prev_') && currentPage > 1) {
                currentPage--;
                await sendOrEditMessage(currentPage, response.callbackQuery.message!.message_id);
                await purchaseMenu(conversation, ctx, user!.role);
            } else if (data.startsWith('next_') && currentPage < totalPages) {
                currentPage++;
                await sendOrEditMessage(currentPage, response.callbackQuery.message!.message_id);
                await purchaseMenu(conversation, ctx, user!.role);
            }
        } else if (response.message?.text) {
            const selectedOption = response.message?.text;
            if (ctx.session.language === LanguageEnum.uz) {
                switch (selectedOption) {
                    case Purchases_uz.CREATING_PURCHASE:
                        ctx.session.currentStep = ConversationStepsEnum.CREATING_ORDERS;
                        await handleCreatingPurchase(conversation, ctx);
                        break;
                    case Purchases_uz.CONFIRMED_ORDERS:
                        ctx.session.currentStep = ConversationStepsEnum.CONFIRMED_ORDERS
                        await handleConfirmedOrders(conversation, ctx);
                        break;
                    case Purchases_uz.PENDING_ORDERS:
                        ctx.session.currentStep = ConversationStepsEnum.PENDING_ORDERS
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
