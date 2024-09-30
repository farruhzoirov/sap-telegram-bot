import {MyContext} from "../../common/types/session-context";
import {LanguageEnum} from "../../common/enums/language.enum";

export async function handleCompletedOrders(ctx: MyContext, language: string) {
    // Logic to retrieve completed orders
    const completedOrders = ['Completed Order 1', 'Completed Order 2'];  // Mock data

    if (completedOrders.length > 0) {
        await ctx.reply(
            language === LanguageEnum.uz
                ? `Tugallangan buyurtmalar:\n${completedOrders.join('\n')}`
                : `Завершенные заказы:\n${completedOrders.join('\n')}`
        );
    } else {
        await ctx.reply(
            language === LanguageEnum.uz
                ? "Sizda tugallangan buyurtmalar yo'q."
                : "У вас нет завершенных заказов."
        );
    }
}
