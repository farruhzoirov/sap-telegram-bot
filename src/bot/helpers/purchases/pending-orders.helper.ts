import {MyContext} from "../../common/types/session-context";
import {LanguageEnum} from "../../common/enums/language.enum";
import {Conversation} from "@grammyjs/conversations";
import { getPendingOrders} from "../../services/orders.service";
import {InlineKeyboard} from "grammy";

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

let currentPage = 1;

export async function handlePendingOrders(conversation: Conversation<MyContext>, ctx: MyContext, language: string): Promise<void> {
    const pendingOrders: PendingOrdersResponse = await getPendingOrders();
    let itemIndex = 1;

    if (pendingOrders && pendingOrders.value.length) {
        const totalPages = Math.ceil(pendingOrders.value.length / ITEMS_PER_PAGE);
        const showPage = (page: number): { message: string; keyboard: InlineKeyboard } => {
            const start = (page - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const pageOrders = pendingOrders.value.slice(start, end);

            const items = pageOrders.map((order) => {
                return order.DocumentLines.map((line, index) => {
                    const quantity = line.Quantity;
                    const price = line.UnitPrice || 0;
                    const currency = line.Currency || '';
                    const result = `${index + 1}) ${line.ItemCode} (Qty: ${quantity}, Price: ${price}${currency}) \n`;
                    // itemIndex++;
                    return result;
                }).join('\n');
            }).join('\n');

            const message = language === 'uz'
                ? `<b>Kutilayotgan buyurtmalar (Sahifa ${page}/${totalPages})</b>\n${items}`
                : `<b>Ваши заказы в ожидании (Страница ${page}/${totalPages})</b>\n${items}`;

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
                // If editing fails, send a new message
                await ctx.reply(message, {parse_mode: "HTML", reply_markup: keyboard});
            }
        };
        await sendOrEditMessage(currentPage);
        while (true) {
            const response = await conversation.waitFor(['callback_query:data', 'message']);

            if (response.callbackQuery?.data) {
                const data = response.callbackQuery.data;

                if (data === 'back') {
                    await ctx.answerCallbackQuery();
                    break;
                }
                const match = data?.match(/^(prev|next)_(\d+)$/);


                if (match) {
                    const [_, action, pageStr] = match;
                    let page = parseInt(pageStr, 10);

                    if (action === 'prev' && page > 1) page--;
                    if (action === 'next' && page < totalPages) page++;
                    currentPage = page;

                    const messageId = response.callbackQuery.message?.message_id;
                    if (messageId) {
                        await sendOrEditMessage(currentPage, messageId);
                    } else {
                        await sendOrEditMessage(currentPage);
                    }
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    } else {
        await ctx.reply(
            language === 'uz'
                ? "Sizda kutilayotgan buyurtmalar yo'q."
                : "У вас нет заказов в ожидании."
        );
    }
}







