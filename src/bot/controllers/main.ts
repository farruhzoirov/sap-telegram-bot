// import { MyContext } from "../../common/types/session-context";
// import { LanguageEnum } from "../../common/enums/language.enum";
// import { Conversation } from "@grammyjs/conversations";
// import { getItemsForOrder } from "../../services/orders.service";
// import {ConversationStepsEnum} from "../../common/enums/conversation-steps.enum";
// import {PurchasesMenu} from "../../common/enums/main-menu.enums";
// import {User} from "../../models/user.schema";
// import {purchaseMenu} from "../../controllers/purchases-menu";
// // import { sellerTelegramId } from "../../config/sapConfig";
//
// function paginateItems(items: any[], currentPage: number, itemsPerPage: number) {
//     const startIndex = currentPage * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     return items.slice(startIndex, endIndex);
// }
//
// export async function handleCreatingPurchase(conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> {
//     const ITEMS_PER_PAGE = 10;
//     const totalItems = await getItemsForOrder();
//     const totalPages = Math.ceil(totalItems.value.length / ITEMS_PER_PAGE);
//
//     if (!ctx.session.order) {
//         ctx.session.order = [];
//     }
//     await handlePurchaseStep(conversation, ctx, totalItems.value, 0, totalPages, ITEMS_PER_PAGE);
// }
// async function handlePurchaseStep(
//     conversation: Conversation<MyContext>,
//     ctx: MyContext,
//     items: any[],
//     currentPage: number,
//     totalPages: number,
//     itemsPerPage: number
// ): Promise<void> {
//     const paginatedItems = paginateItems(items, currentPage, itemsPerPage);
//     const itemList = paginatedItems.map((item: any, index: any) => `${index + 1}. ${item.ItemCode} ${item.ItemName}`).join("\n");
//
//     const message = await ctx.reply(
//         ctx.session.language === LanguageEnum.uz
//             ? `Sahifa: ${currentPage + 1}/${totalPages}\n Mahsulot tanlang:\n${itemList}`
//             : `Страница: ${currentPage + 1}/${totalPages}\nВыберите товар:\n${itemList}`,
//         {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{text: "⬅️ Previous", callback_data: "prev"}, {text: "Next ➡️", callback_data: "next"}],
//                     [{text: "✅ Select", callback_data: "select"}],
//                     [{text: "✅ Finish", callback_data: "finish"}]
//                 ],
//             },
//         }
//     );
//
//     try {
//         let { callbackQuery } = await conversation.waitFor("callback_query:data");
//         console.log("Received callback query:", callbackQuery);
//         console.log("Callback data:", callbackQuery.data);
//
//         if (!callbackQuery || !callbackQuery.data) {
//             console.log("Invalid callback query received");
//             return;
//         }
//         switch (callbackQuery?.data) {
//             case "next":
//                 console.log("Handling 'next' action");
//                 await handlePurchaseStep(conversation, ctx, items, Math.min(currentPage + 1, totalPages - 1), totalPages, itemsPerPage);
//                 break;
//             case "prev":
//                 console.log("Handling 'prev' action");
//                 await handlePurchaseStep(conversation, ctx, items, Math.max(currentPage - 1, 0), totalPages, itemsPerPage);
//                 break;
//             case "select":
//                 console.log("Handling 'select' action");
//                 await handleItemSelection(conversation, ctx, paginatedItems);
//                 await handlePurchaseStep(conversation, ctx, items, currentPage, totalPages, itemsPerPage);
//                 break;
//             case "finish":
//                 console.log("Handling 'finish' action");
//                 await handleFinishOrder(conversation, ctx);
//                 break;
//             default:
//                 console.log("Unknown callback data received:", callbackQuery.data);
//                 break;
//         }
//     } catch (error) {
//         console.error("Error handling callback query:", error);
//         await ctx.reply("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
//     }
// }
//
// async function handleItemSelection(conversation: Conversation<MyContext>, ctx: MyContext, items: any[]): Promise<void> {
//     await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Mahsulot raqamini kiriting:" : "Введите номер товара:");
//     const { message: itemSelectionMessage } = await conversation.waitFor("message:text");
//     const selectedItemIndex = parseInt(itemSelectionMessage.text, 10) - 1;
//
//     if (isNaN(selectedItemIndex) || selectedItemIndex < 0 || selectedItemIndex >= items.length) {
//         await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Noto'g'ri tanlov!" : "Неверный выбор!");
//         return;
//     }
//
//     const selectedItem = items[selectedItemIndex];
//
//     if (ctx.session.order.find((order) => order.item.ItemCode === selectedItem.ItemCode)) {
//         await ctx.reply(
//             ctx.session.language === LanguageEnum.uz
//                 ? `Bu mahsulot oldin tanlangan!`
//                 : `Этот товар уже был выбран!`
//         );
//         return;
//     }
//
//     await ctx.reply(
//         ctx.session.language === LanguageEnum.uz
//             ? `Siz tanlagan mahsulot: ${selectedItem.ItemName}\nMiqdorini kiriting:`
//             : `Вы выбрали товар: ${selectedItem.ItemName}\nВведите количество:`
//     );
//
//     const { message: quantityMessage } = await conversation.waitFor("message:text");
//     const quantity = parseInt(quantityMessage.text, 10);
//
//     if (isNaN(quantity) || quantity <= 0) {
//         await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Noto'g'ri miqdor!" : "Неверное количество!");
//         return;
//     }
//
//     let comment = '';
//     await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Mahsulotga izoh qo'shishni xohlaysizmi? (Ha/Yo'q)" : "Хотите добавить комментарий к товару? (Да/Нет)");
//     const { message: commentConfirmationMessage } = await conversation.waitFor("message:text");
//
//     if (commentConfirmationMessage.text.toLowerCase() === (ctx.session.language === LanguageEnum.uz ? "ha" : "да")) {
//         await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Izohingizni kiriting:" : "Введите ваш комментарий:");
//         const { message: commentMessage } = await conversation.waitFor("message:text");
//         comment = commentMessage.text;
//     }
//
//     ctx.session.order.push({
//         item: selectedItem,
//         quantity: quantity,
//         comment: comment
//     });
//
//     await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Mahsulot savatchaga qo'shildi!" : "Товар добавлен в корзину!");
// }
// async function handleFinishOrder(conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> {
//     if (!ctx.session.order.length) {
//         await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Siz hech qanday mahsulot tanlamadingiz." : "Вы не выбрали ни одного товара.");
//         return;
//     }
//
//     const orderSummary = ctx.session.order.map((entry, index) =>
//         `${index + 1}. ${entry.item.ItemName} - ${entry.quantity} (Izoh: ${entry.comment || "Yo'q"})`
//     ).join("\n");
//
//     await ctx.reply(
//         ctx.session.language === LanguageEnum.uz
//             ? `Sizning buyurtmangiz:\n${orderSummary}\n Tasdiqlaysizmi? (Ha/Yo'q)`
//             : `Ваш заказ:\n${orderSummary}\n Подтверждаете? (Да/Нет)`
//     );
//
//     const { message: confirmationMessage } = await conversation.waitFor("message:text");
//     const confirmation = confirmationMessage.text.toLowerCase();
//
//     if (confirmation === (ctx.session.language === LanguageEnum.uz ? "ha" : "да")) {
//         const sellerId = "689888057";
//         await ctx.api.sendMessage(
//             sellerId,
//             ctx.session.language === LanguageEnum.uz ? `Yangi buyurtma kelib tushdi:\n${orderSummary}` : `Поступил новый заказ:\n${orderSummary}`
//         );
//         await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Buyurtma muvaffaqiyatli yuborildi!" : "Заказ успешно отправлен!");
//         ctx.session.currentStep  = ConversationStepsEnum.PURCHASES;
//         let user = await User.findOne({telegramId: ctx!.from!.id});
//         await purchaseMenu(conversation, ctx, user!.role)
//         ctx.session.order = [];
//     } else {
//         await ctx.reply(ctx.session.language === LanguageEnum.uz ? "Buyurtma bekor qilindi." : "Заказ отменен.");
//         ctx.session.order = [];
//     }
// }