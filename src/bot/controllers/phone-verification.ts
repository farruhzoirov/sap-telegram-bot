import {Conversation} from '@grammyjs/conversations';
import {translates} from '../translates/translate';
import {verifyPhoneNumberService} from '../services/verify-phone-number.service';
import {MyContext} from '../common/types/session-context';



export async function verifyPhoneNumber(
    conversation: Conversation<MyContext>,
    ctx: MyContext,
    language: string,
    userPhone: string
): Promise<any> {
    console.log('Requested Verify Phone Number');

    try {
        const user = await verifyPhoneNumberService(userPhone, ctx.from?.id);

        if (!user) {
            await ctx.reply(
                language === 'uz' ? translates['uz'].replying_auth_bad : translates['ru'].replying_auth_bad
            );
            return null;
        }

        await ctx.reply(
            language === 'uz' ? translates['uz'].replying_auth_success : translates['ru'].replying_auth_success
        );

        // Update user's language preference
        await user.updateOne({ language: language });

        return user;
    } catch (error) {
        console.error('Error verifying phone number:', error);
        await ctx.reply(
            language === 'uz' ? translates['uz'].error_occurred : translates['ru'].error_occurred
        );
        return null;
    }
}