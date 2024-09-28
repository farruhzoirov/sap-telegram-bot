import {Conversation} from '@grammyjs/conversations';
import {MyContext} from '../common/types/session-context';
import {handleLanguageSelection} from './language-selection';
import {verifyPhoneNumber} from './phone-verification';
import {handleMainMenu} from './main-menu';
import {ConversationSteps} from '../common/enums/conversation-steps';
import {purchaseMenu} from "./purchases-menu";
import {PaymentMenu, PurchasesMenu} from "../common/enums/main-menu";
import {Back} from "../common/enums/inline-menu-enums";
import {paymentsMenu} from "./payments-menu";
import {askingPhone} from "./asking-phone";
import {validatePhone} from "./validate-phone";
import {ConversationModel} from "../models/conversation-model";

export async function multiStepConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
    let currentStep =  ConversationSteps.LANGUAGE_SELECTION;
    let language: string = '';
    let userPhone: string = '';
    let user: any = null;
    let selectedOption: any;

    while (currentStep !== ConversationSteps.COMPLETED) {
        try {
            console.log('Current step', currentStep);
            switch (currentStep) {
                case ConversationSteps.LANGUAGE_SELECTION:
                    language = await handleLanguageSelection(conversation, ctx);
                    currentStep = ConversationSteps.ASKING_PHONE;
                    break;
                case ConversationSteps.ASKING_PHONE:
                    try {
                        userPhone = await askingPhone(conversation, ctx, language);
                        console.log(userPhone)
                        currentStep = ConversationSteps.VALIDATION_PHONE;
                    } catch (error) {
                        await ctx.reply('Please provide a valid phone number.');
                        continue;
                    }
                    break;

                case ConversationSteps.VALIDATION_PHONE:
                    const isValid = await validatePhone(conversation, ctx, language, userPhone);
                    if (isValid) {
                        currentStep = ConversationSteps.PHONE_VERIFICATION;
                    } else {
                        currentStep = ConversationSteps.ASKING_PHONE;
                    }
                    break;

                case ConversationSteps.PHONE_VERIFICATION:
                    user = await verifyPhoneNumber(conversation, ctx, language, userPhone);
                    console.log('user', user)
                    currentStep = ConversationSteps.MAIN_MENU;
                    break;
                case ConversationSteps.MAIN_MENU:
                    selectedOption = await handleMainMenu(conversation, ctx, language);
                    console.log(selectedOption)
                    if (selectedOption === PurchasesMenu.PURCHASES_UZ || selectedOption === PurchasesMenu.PURCHASES_RU) {
                        currentStep = ConversationSteps.PURCHASES;
                    } else if (selectedOption === PaymentMenu.PAYMENTS_UZ || selectedOption === PaymentMenu.PAYMENTS_RU) {
                        currentStep = ConversationSteps.PAYMENTS;
                    } else {
                        currentStep = ConversationSteps.COMPLETED;
                    }
                    break;
                case ConversationSteps.PURCHASES:
                    selectedOption = await purchaseMenu(conversation, ctx, user!.role, language);
                    currentStep = (selectedOption === Back.BACK_UZ || selectedOption === Back.BACK_RU) ? ConversationSteps.MAIN_MENU : ConversationSteps.COMPLETED;
                    break;
                case ConversationSteps.PAYMENTS:
                    selectedOption = await paymentsMenu(conversation, ctx, user!.role, language);
                    currentStep = (selectedOption === Back.BACK_UZ || selectedOption === Back.BACK_RU) ? ConversationSteps.MAIN_MENU : ConversationSteps.COMPLETED;
                    break;
                default:
                    currentStep = ConversationSteps.COMPLETED;
            }
        } catch (error) {
            console.error(`Error in step ${currentStep}:`, error);
            await ctx.reply(`An error occurred. Please try again or contact support.`);
            currentStep = ConversationSteps.COMPLETED;
        }
    }
}