import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../common/types/session-context";
import { LanguageEnum } from "../common/enums/language.enum";
import { getPurchasesMenuByRole } from "../helpers/buttonsByRole.helper";
import { Back } from "../common/enums/inline-menu-enums";
import { Purchases_uz, Purchases_ru } from "../common/enums/purchases.enum";

// Purchases order helpers
import { handlePendingOrders } from "../helpers/purchases/pending-orders.helper";
import { handleCreatingPurchase } from "../helpers/purchases/creating-order.helper";
import { handleInTransitOrders } from "../helpers/purchases/intransit-order.helper";
import { handleConfirmedOrders } from "../helpers/purchases/confirmed-orders.helper";
import { handleCompletedOrders } from "../helpers/purchases/completed-order.helper";

export async function purchaseMenu(conversation: Conversation<MyContext>, ctx: MyContext, role: string, language: string): Promise<string> {
    while (true) {
        let keyboard = await getPurchasesMenuByRole(role, language);
        await ctx.reply(
            language === LanguageEnum.uz ? 'Haridlar bo\'limi' : 'Раздел покупок',
            {
                reply_markup: {
                    keyboard: keyboard!.build(),
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            }
        );

        const { message: buttonMessage } = await conversation.waitFor('message:text');
        let selectedOption = buttonMessage!.text;

        if (language === LanguageEnum.uz) {
            switch (selectedOption) {
                case Purchases_uz.CREATING_PURCHASE:
                    await handleCreatingPurchase(ctx, language);
                    break;
                case Purchases_uz.PENDING_ORDERS:
                    await handlePendingOrders(conversation, ctx, language);
                    break;
                case Purchases_uz.CONFIRMED_ORDERS:
                    await handleConfirmedOrders(conversation, ctx, language);
                    break;
                case Purchases_uz.IN_WAY_ORDERS:
                    await handleInTransitOrders(conversation, ctx, language);
                    break;
                case Purchases_uz.COMPLETED_ORDERS:
                    await handleCompletedOrders(ctx, language);
                    break;
                case Back.BACK_UZ:
                    return Back.BACK_UZ;
            }
        } else if (language === LanguageEnum.ru) {
            switch (selectedOption) {
                case Purchases_ru.CREATING_PURCHASE:
                    await handleCreatingPurchase(ctx, language);
                    break;
                case Purchases_ru.PENDING_ORDERS:
                    await handlePendingOrders(conversation, ctx, language);
                    break;
                case Purchases_ru.CONFIRMED_ORDERS:
                    await handleConfirmedOrders(conversation, ctx, language);
                    break;
                case Purchases_ru.IN_WAY_ORDERS:
                    await handleInTransitOrders(conversation, ctx, language);
                    break;
                case Purchases_ru.COMPLETED_ORDERS:
                    await handleCompletedOrders(ctx, language);
                    break;
                case Back.BACK_RU:
                    return Back.BACK_RU;
            }
        }

        // After handling the selected option, the loop continues, presenting the menu again
    }
}