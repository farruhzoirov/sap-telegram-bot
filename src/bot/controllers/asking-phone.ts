import {Conversation} from "@grammyjs/conversations";
import {Keyboard} from "grammy";

// Main type
import {MyContext} from "../common/types/session-context";
// Language Enum
import {LanguageEnum} from "../common/enums/language.enum";

// Translates for two language
import {translates} from "../translates/translate";

export async function askingPhone(conversation: Conversation<MyContext>, ctx: MyContext, language: string): Promise<string> {
    const keyboard = new Keyboard()
        .requestContact(language === LanguageEnum.uz ? translates.uz.share_phone : translates.ru.share_phone)
        .resized();
    await ctx.reply(
        language === LanguageEnum.uz ? translates.uz.asking_phone : translates.ru.asking_phone,
        {
            reply_markup: keyboard
        }
    );

    const {message} = await conversation.waitFor('message:contact');

    let phoneNumber = message?.contact?.phone_number;

    if (!phoneNumber) {
        throw new Error('Phone number not provided');
    }

    if (!phoneNumber.startsWith('+')) {
        phoneNumber = `+${phoneNumber}`;
    }
    return phoneNumber;
}
