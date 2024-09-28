import mongoose, {Schema, Document} from 'mongoose';

interface User extends Document {
  userId: string,
  username: string
  jobTitle: string,
  phone: string,
  role: string
}

const UserSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String, enum: ['user', 'admin'], default: 'user',
    required: true,
  }
}, {
  timestamps: true,
});

export const User = mongoose.model<User>('User', UserSchema);
