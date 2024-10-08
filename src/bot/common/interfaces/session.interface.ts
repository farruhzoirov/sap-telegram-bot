// Define the structure for session data
import {ConversationStepsEnum} from "../enums/conversation-steps.enum";
import {Order} from "./order";


 export interface SessionData {
    language: string;
    currentStep: ConversationStepsEnum;
    order: Order[]
}