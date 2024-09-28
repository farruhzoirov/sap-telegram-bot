import {Conversation} from '@grammyjs/conversations';
import {translates} from '../translates/translate';
import {verifyPhoneNumberService} from '../services/verify-phone-number.service';
import {MyContext} from '../common/types/session-context';

export async function verifyPhoneNumber(conversation: Conversation<MyContext>, ctx: MyContext, language: string, userPhone: string): Promise<any> {
    console.log('Requested Verify Phone Number');
    const user = await verifyPhoneNumberService(userPhone);
    if (!user) {
        await ctx.reply(
            language === 'uz' ? translates['uz'].replying_auth_bad : translates['ru'].replying_auth_bad
        );
        return;
    }
    await ctx.reply(
        language === 'uz' ? translates['uz'].replying_auth_success : translates['ru'].replying_auth_success,
    );
    return user;
}