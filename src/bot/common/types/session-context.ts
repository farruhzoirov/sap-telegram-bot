import { Context, SessionFlavor } from 'grammy';
import { ConversationFlavor } from '@grammyjs/conversations';
import { ConversationSteps } from "../enums/conversation-steps";

// Define the structure for session data
interface SessionData {
  language?: string;
  currentStep: ConversationSteps;
}

// Combine the base Context with session and conversation flavors
export type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
