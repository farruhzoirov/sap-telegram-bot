import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../common/types/session-context";
import {LanguageEnum} from "../common/enums/language.enum";
import {translates} from "../translates/translate";


export async function validatePhone(conversation: Conversation<MyContext>, ctx: MyContext, language: string, text: string): Promise<boolean> {
    if (!text || !text.includes('998')) {
        await ctx.reply(
            language === 'uz' ? translates['uz'].invalid_phone : translates['ru'].invalid_phone
        );
        return false;
    }
    return true;
}