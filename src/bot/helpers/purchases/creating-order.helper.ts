import {MyContext} from "../../common/types/session-context";
import {LanguageEnum} from "../../common/enums/language.enum";
import {Conversation, ConversationFlavor} from "@grammyjs/conversations";
import {getItemsForOrder} from "../../services/orders.service";
import {sellerTelegramId} from "../../config/sapConfig";
import {CallbackQuery} from "grammy/out/types";

type MyConversation = Conversation<MyContext & ConversationFlavor>;

function paginateItems(items: any[], currentPage: number, itemsPerPage: number) {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
}

export async function handleCreatingPurchase(conversation: MyConversation, ctx: MyContext): Promise<void> {
    let currentPage = 0;
    const ITEMS_PER_PAGE = 10;
    const totalItems = await getItemsForOrder();
    const totalPages = Math.ceil(totalItems.value.length / ITEMS_PER_PAGE);

    ctx.session.order = ctx.session.order || [];

    while (true) {
        try {
            const items = paginateItems(totalItems.value, currentPage, ITEMS_PER_PAGE);
            const itemList = items.map((item: any, index: number) => `${index + 1}. ${item.ItemCode} ${item.ItemName}`).join("\n");

            const navigationButtons = [];
            if (currentPage > 0) navigationButtons.push({text: "⬅️ Previous", callback_data: "prev"});
            if (currentPage < totalPages - 1) navigationButtons.push({text: "Next ➡️", callback_data: "next"});

            await ctx.reply(
                ctx.session.language === LanguageEnum.uz
                    ? `Sahifa: ${currentPage + 1}/${totalPages}\n Mahsulot tanlang:\n${itemList}`
                    : `Страница: ${currentPage + 1}/${totalPages}\nВыберите товар:\n${itemList}`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            navigationButtons,
                            [{text: "✅ Select", callback_data: "select"}],
                            [{text: "✅ Finish", callback_data: "finish"}]
                        ],
                    },
                }
            );

            const result = await conversation.waitFor(["callback_query:data", "message:text"], {maxMilliseconds: 300000});  // 5 minute timeout

            if (!result) {
                await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Vaqt tugadi. Iltimos, qaytadan boshlang." : "Время истекло. Пожалуйста, начните заново.");
                return;
            }

            if ("callbackQuery" in result && result.callbackQuery) {
                await handleCallbackQuery(result.callbackQuery, conversation, ctx, items, currentPage, totalPages);
                if (result.callbackQuery.data === "finish" && await handleOrderFinish(conversation, ctx)) {
                    break;
                }
                currentPage = updateCurrentPage(result.callbackQuery.data, currentPage, totalPages);
            } else if ("message" in result && result.message) {
                await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Iltimos, tugmalardan foydalaning." : "Пожалуйста, используйте кнопки.");
            }
        } catch (error) {
            console.error("Error in handleCreatingPurchase:", error);
            await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring." : "Произошла ошибка. Пожалуйста, попробуйте снова.");
        }
    }
}

async function handleCallbackQuery(
    callbackQuery: CallbackQuery,
    conversation: MyConversation,
    ctx: MyContext,
    items: any[],
    currentPage: number,
    totalPages: number
): Promise<void> {
    // try {
    //     await ctx.answerCallbackQuery(callbackQuery.id);
    // } catch (error) {
    //     console.error("Error answering callback query:", error);
    // }

    console.log('Main callback', callbackQuery.data);

    if (callbackQuery.data === "select") {
        await handleItemSelection(conversation, ctx, items);
    }
}

function updateCurrentPage(action: string, currentPage: number, totalPages: number): number {
    if (action === "next") return Math.min(currentPage + 1, totalPages - 1);
    if (action === "prev") return Math.max(currentPage - 1, 0);
    return currentPage;
}

async function handleItemSelection(conversation: MyConversation, ctx: MyContext, items: any[]): Promise<void> {
    await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Mahsulot raqamini kiriting:" : "Введите номер товара:");
    const result = await conversation.waitFor("message:text", {maxMilliseconds: 60000});  // 1 minute timeout

    if (!result) {
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Vaqt tugadi. Iltimos, qaytadan tanlang." : "Время истекло. Пожалуйста, выберите снова.");
        return;
    }

    const selectedItemIndex = parseInt(result.message.text, 10) - 1;
    const selectedItem = items[selectedItemIndex];
    if (!selectedItem) {
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Noto'g'ri tanlov! Iltimos, ro'yxatdagi raqamni kiriting." : "Неверный выбор! Пожалуйста, введите номер из списка.");
        return;
    }
    if (ctx.session.order.some(order => order.item.ItemCode === selectedItem.ItemCode)) {
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Bu mahsulot oldin tanlangan! Boshqa mahsulot tanlang." : "Этот товар уже был выбран! Выберите другой товар.");
        return;
    }

    await ctx.reply(
        ctx.session.language === LanguageEnum.uz
            ? `Siz tanlagan mahsulot: ${selectedItem.ItemName}\nMiqdorini kiriting:`
            : `Вы выбрали товар: ${selectedItem.ItemName}\nВведите количество:`
    );

    const quantityResult = await conversation.waitFor("message:text", {maxMilliseconds: 60000});
    if (!quantityResult) {
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Vaqt tugadi. Iltimos, qaytadan tanlang." : "Время истекло. Пожалуйста, выберите снова.");
        return;
    }

    const quantity = parseInt(quantityResult.message.text, 10);

    if (isNaN(quantity) || quantity <= 0) {
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Noto'g'ri miqdor! Iltimos, musbat son kiriting." : "Неверное количество! Пожалуйста, введите положительное число.");
        return;
    }

    let comment = '';
    await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Mahsulotga izoh qo'shishni xohlaysizmi? (Ha/Yo'q)" : "Хотите добавить комментарий к товару? (Да/Нет)");
    const commentConfirmResult = await conversation.waitFor("message:text", {maxMilliseconds: 60000});

    if (commentConfirmResult && commentConfirmResult.message.text.toLowerCase() === (ctx.session.language === LanguageEnum.uz ? "ha" : "да")) {
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Izohingizni kiriting:" : "Введите ваш комментарий:");
        const commentResult = await conversation.waitFor("message:text", {maxMilliseconds: 120000});
        if (commentResult) {
            comment = commentResult.message.text;
        }
    }
    ctx.session.order.push({
        item: selectedItem,
        quantity: quantity,
        comment: comment
    });
    console.log(ctx.session.order);
    await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Mahsulot savatchaga qo'shildi!" : "Товар добавлен в корзину!");
}

async function handleOrderFinish(conversation: MyConversation, ctx: MyContext): Promise<boolean> {
    if (!ctx.session.order.length) {
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Siz hech qanday mahsulot tanlamadingiz." : "Вы не выбрали ни одного товара.");
        return false;
    }

    const orderSummary = ctx.session.order.map((entry, index) =>
        `${index + 1}. ${entry.item.ItemName} - ${entry.quantity} ${ctx.session.language === LanguageEnum.uz ? "(Izoh: " : "(Комментарий: "}${entry.comment || (ctx.session.language === LanguageEnum.uz ? "Yo'q" : "Нет")})`
    ).join("\n");

    await ctx.reply(
        ctx.session.language === LanguageEnum.uz
            ? `Sizning buyurtmangiz:\n${orderSummary}\n\nTasdiqlaysizmi? (Ha/Yo'q)`
            : `Ваш заказ:\n${orderSummary}\n\nПодтверждаете? (Да/Нет)`
    );

    const result = await conversation.waitFor("message:text", {maxMilliseconds: 120000});  // 2 minute timeout

    if (!result) {
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Vaqt tugadi. Buyurtma bekor qilindi." : "Время истекло. Заказ отменен.");
        ctx.session.order = [];
        return true;
    }

    const confirmation = result.message.text.toLowerCase();

    if (confirmation === (ctx.session.language === LanguageEnum.uz ? "ha" : "да")) {
        const sellerId = sellerTelegramId;
        await ctx.api.sendMessage(
            sellerId,
            ctx.session.language === LanguageEnum.uz ? `Yangi buyurtma kelib tushdi:\n${orderSummary}` : `Поступил новый заказ:\n${orderSummary}`
        );
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Buyurtma muvaffaqiyatli yuborildi!" : "Заказ успешно отправлен!");
        ctx.session.order = [];
        return true;
    } else {
        await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Buyurtma bekor qilindi." : "Заказ отменен.");
        ctx.session.order = [];
        return true;
    }
}