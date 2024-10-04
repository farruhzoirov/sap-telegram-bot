// import {Conversation} from '@grammyjs/conversations';
//
// // Types
// import {MyContext} from '../common/types/session-context';
//
// // Controllers
// import {handleLanguageSelection} from './language-selection';
// import {verifyPhoneNumber} from './phone-verification';
// import {handleMainMenu} from './main-menu';
// import {purchaseMenu} from "./purchases-menu";
// import {paymentsMenu} from "./payments-menu";
// import {askingPhone} from "./asking-phone";
// import {validatePhone} from "./validate-phone";
// import {handleUserSettings} from './settings-menu';
//
// // User model
// import {User} from '../models/user.schema';
//
// // Enums
// import {ConversationStepsEnum} from '../common/enums/conversation-steps.enum';
// import {PaymentMenu, PurchasesMenu, SettingsMenu} from "../common/enums/main-menu.enums";
// import {Back} from "../common/enums/inline-menu-enums";
//
//
// export async function multiStepConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
//     let currentStep = ConversationStepsEnum.LANGUAGE_SELECTION;
//     let user: any = null;
//     let selectedOption: any;
//     let userPhone = ""
//
//     // Check if user already exists
//     const existingUser = await User.findOne({ telegramId: ctx.from?.id });
//     if (existingUser) {
//         user = existingUser;
//         currentStep = ConversationStepsEnum.MAIN_MENU;
//     }
//     if (!ctx.session.language) {
//         currentStep = ConversationStepsEnum.LANGUAGE_SELECTION;
//     }
//
//     while (currentStep !== ConversationStepsEnum.COMPLETED) {
//         try {
//             switch (currentStep) {
//                 case ConversationStepsEnum.LANGUAGE_SELECTION:
//                     await handleLanguageSelection(conversation, ctx);
//                     currentStep = user.length ? ConversationStepsEnum.MAIN_MENU : ConversationStepsEnum.ASKING_PHONE;
//                     break;
//                 case ConversationStepsEnum.ASKING_PHONE:
//                     try {
//                         userPhone = await askingPhone(conversation, ctx, ctx.session.language);
//                         console.log(userPhone)
//                         currentStep = ConversationStepsEnum.VALIDATION_PHONE;
//                     } catch (error) {
//                         await ctx.reply('Please provide a valid phone number.');
//                         continue;
//                     }
//                     break;
//                 case ConversationStepsEnum.VALIDATION_PHONE:
//                     const isValid = await validatePhone(conversation, ctx, ctx.session.language, userPhone);
//                     if (isValid) {
//                         currentStep = ConversationStepsEnum.PHONE_VERIFICATION;
//                     } else {
//                         currentStep = ConversationStepsEnum.ASKING_PHONE;
//                     }
//                     break;
//                 case ConversationStepsEnum.PHONE_VERIFICATION:
//                     user = await verifyPhoneNumber(conversation, ctx, ctx.session.language, userPhone);
//                     if (user) {
//                         currentStep = ConversationStepsEnum.MAIN_MENU;
//                     } else {
//                         await ctx.reply(ctx.session.language === 'uz' ? 'Telefon raqami topilmadi.' : 'Номер телефона не найден.');
//                         currentStep = ConversationStepsEnum.ASKING_PHONE;
//                     }
//                     break;
//                 case ConversationStepsEnum.MAIN_MENU:
//                     selectedOption = await handleMainMenu(conversation, ctx, ctx.session.language);
//                     console.log(selectedOption)
//                     if (selectedOption === PurchasesMenu.PURCHASES_UZ || selectedOption === PurchasesMenu.PURCHASES_RU) {
//                         currentStep = ConversationStepsEnum.PURCHASES;
//                     } else if (selectedOption === PaymentMenu.PAYMENTS_UZ || selectedOption === PaymentMenu.PAYMENTS_RU) {
//                         currentStep = ConversationStepsEnum.PAYMENTS;
//                     } else if (selectedOption === SettingsMenu.SETTINGS_UZ || selectedOption === SettingsMenu.SETTINGS_RU) {
//                         currentStep = ConversationStepsEnum.SETTINGS;
//                     } else {
//                         currentStep = ConversationStepsEnum.COMPLETED;
//                     }
//                     break;
//                 case ConversationStepsEnum.PURCHASES:
//                     selectedOption = await purchaseMenu(conversation, ctx, user!.role, ctx.session.language);
//                     console.log("Selected Option", selectedOption)
//                     currentStep = (selectedOption === Back.BACK_UZ || selectedOption === Back.BACK_RU) ? ConversationStepsEnum.MAIN_MENU : ConversationStepsEnum.PURCHASES;
//                     break;
//                 case ConversationStepsEnum.PAYMENTS:
//                     selectedOption = await paymentsMenu(conversation, ctx, user!.role, ctx.session.language);
//                     currentStep = (selectedOption === Back.BACK_UZ || selectedOption === Back.BACK_RU) ? ConversationStepsEnum.MAIN_MENU : ConversationStepsEnum.PAYMENTS;
//                     break;
//                 case ConversationStepsEnum.SETTINGS:
//                     await handleUserSettings(conversation, ctx);
//                     currentStep = ConversationStepsEnum.MAIN_MENU;
//                     break;
//                 default:
//                     currentStep = ConversationStepsEnum.COMPLETED;
//             }
//         } catch (error) {
//             console.error(`Error in step ${currentStep}:`, error);
//             await ctx.reply(`An error occurred. Please try again or contact support.`);
//             currentStep = ConversationStepsEnum.COMPLETED;
//         }
//     }
// }
//
//
//
