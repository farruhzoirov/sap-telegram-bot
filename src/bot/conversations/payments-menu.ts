import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../common/types/session-context";
import {Language} from "../common/enums/language";
import {getPaymentsMenuByRole, getPurchasesMenuByRole} from "../helpers/buttonsByRole.helper";


export async function paymentsMenu(conversation: Conversation<MyContext>, ctx: MyContext, role: string, language: string) {
    let keyboard = await getPaymentsMenuByRole(role, language);
    await ctx.reply(
        language === Language.uz ? "To'lovlar bo'limi" : 'Раздел платежи',
        {
            reply_markup: {
                keyboard: keyboard!.build(),
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        }
    );

    const {message: buttonMessage} = await conversation.waitFor('message:text');
    let selectedOption = buttonMessage!.text;
    return selectedOption;
}
