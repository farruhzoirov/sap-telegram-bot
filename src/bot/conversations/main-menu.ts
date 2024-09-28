import {Conversation} from '@grammyjs/conversations';
import {getInitialButtons} from '../helpers/buttonsByRole.helper';
import {MyContext} from '../common/types/session-context';
import {Language} from "../common/enums/language";

export async function handleMainMenu(conversation: Conversation<MyContext>, ctx: MyContext, language: string) {
    let keyboard = await getInitialButtons(language);
    await ctx.reply(
        language === Language.uz ? "Asosiy menu" : "Главное меню",
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