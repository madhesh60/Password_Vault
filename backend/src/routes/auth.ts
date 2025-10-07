import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Register: client should send { email, password, keySalt }
// keySalt: base64 string used by client to derive encryption key (PBKDF2)
router.post('/register', async (req, res) => {
  try {
    const { email, password, keySalt } = req.body;
    if (!email || !password || !keySalt) return res.status(400).json({ error: 'email,password,keySalt required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'user exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, keySalt });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, keySalt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Login: send { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email,password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    // return token and the keySalt so client can derive encryption key locally
    res.json({ token, keySalt: user.keySalt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
