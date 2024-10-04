import {CallbackQueryContext, Context, SessionFlavor} from 'grammy';
import { ConversationFlavor } from '@grammyjs/conversations';
import {ConversationStepsEnum} from "../enums/conversation-steps.enum";
import {Order} from "../interfaces/order";

// Define the structure for session data
interface SessionData {
  language: string;
  currentStep: ConversationStepsEnum;
  order: Order[]
}



// Combine the base Context with session and conversation flavors
export type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor
