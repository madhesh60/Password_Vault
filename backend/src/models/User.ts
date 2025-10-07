import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  keySalt: { type: String, required: true }, // base64 salt for client-side key derivation
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
