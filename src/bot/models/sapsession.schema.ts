import mongoose, { Schema, Document } from "mongoose";

interface ISapSession extends Document {
  sessionId: string;
  sessionExpiry: number;
}


const SapSessionSchema: Schema = new Schema({
  sessionId: { type: String, required: true },
  sessionExpiry: { type: Number, required: true },
});

export const SapSession = mongoose.model<ISapSession>('SapSession', SapSessionSchema);
