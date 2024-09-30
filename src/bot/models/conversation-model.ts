import { Schema, model } from 'mongoose';
import { ConversationStepsEnum } from '../common/enums/conversation-steps.enum';

const conversationSchema = new Schema({
    userId: { type: String, required: true },
    currentStep: { type: String, enum: Object.values(ConversationStepsEnum), required: true },
    language: { type: String },
    userPhone: { type: String },
}, { timestamps: true });

export const ConversationModel = model('Conversation', conversationSchema);
