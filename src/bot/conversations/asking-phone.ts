import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../common/types/session-context";
import {Language} from "../common/enums/language";
import {translates} from "../translates/translate";
import {Keyboard} from "grammy";

export async function askingPhone(conversation: Conversation<MyContext>, ctx: MyContext, language: string): Promise<string> {
    const keyboard = new Keyboard()
        .requestContact(language === Language.uz ? translates.uz.share_phone : translates.ru.share_phone)
        .resized();
    await ctx.reply(
        language === Language.uz ? translates.uz.asking_phone : translates.ru.asking_phone,
        { reply_markup: keyboard }
    );
    const { message } = await conversation.waitFor('message:contact');

    let phoneNumber = message?.contact?.phone_number;

    if (!phoneNumber) {
        throw new Error('Phone number not provided');
    }

    // Telefon raqamni '+' belgisini tekshirish va standartlashtirish
    if (!phoneNumber.startsWith('+')) {
        phoneNumber = `+${phoneNumber}`;
    }

    console.log(phoneNumber);

    return phoneNumber;
}
