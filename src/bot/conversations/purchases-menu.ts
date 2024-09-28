import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../common/types/session-context";
import {Language} from "../common/enums/language";
import {getPurchasesMenuByRole} from "../helpers/buttonsByRole.helper";


export async function purchaseMenu(conversation: Conversation<MyContext>, ctx: MyContext, role: string, language: string) {
    let keyboard = await getPurchasesMenuByRole(role, language);
    await ctx.reply(
        language === Language.uz ? 'Haridlar bo\'limi' : 'Раздел покупок',
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
