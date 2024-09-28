import { Schema, model } from 'mongoose';
import { ConversationSteps } from '../common/enums/conversation-steps';

const conversationSchema = new Schema({
    userId: { type: String, required: true },
    currentStep: { type: String, enum: Object.values(ConversationSteps), required: true },
    language: { type: String },
    userPhone: { type: String },
}, { timestamps: true });

export const ConversationModel = model('Conversation', conversationSchema);
