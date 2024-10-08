import { Context, SessionFlavor} from 'grammy';
import { ConversationFlavor } from '@grammyjs/conversations';

// Session interface
import {SessionData} from "../interfaces/session.interface";


// Combine the base Context with session and conversation flavors
export type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor
