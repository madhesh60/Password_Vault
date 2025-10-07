import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import vaultRoutes from './routes/vault';

dotenv.config();

const app = express();
app.use(cors({
  origin: "https://password-vault-2-13gs.onrender.com",
  credentials: true,
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/vault', vaultRoutes);

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/password_vault';

app.get("/test", (req, res) => {
  res.json({ message: "Backend working fine ✅" });
});

mongoose.connect(MONGO).then(()=> {
  console.log('Connected to MongoDB');
  app.listen(PORT, ()=> console.log('Server listening on', PORT));
}).catch(err=>{
  console.error('Mongo connect error', err);
});
