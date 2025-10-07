import mongoose from 'mongoose';

const VaultItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, index: true },
  ciphertext: { type: String, required: true }, // base64
  iv: { type: String, required: true }, // base64
}, { timestamps: true });

export default mongoose.model('VaultItem', VaultItemSchema);
