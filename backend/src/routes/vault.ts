import express from 'express';
import auth from '../middleware/auth';
import VaultItem from '../models/VaultItem';
const router = express.Router();

// Protected routes
router.use(auth);

// Create vault item
// Expect { ciphertext, iv }
router.post('/', async (req, res) => {
  try {
    const { ciphertext, iv } = req.body;
    if (!ciphertext || !iv) return res.status(400).json({ error: 'ciphertext,iv required' });
    const item = await VaultItem.create({ userId: req.userId, ciphertext, iv });
    res.json({ id: item._id, createdAt: item.createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// List all items for user (encrypted blobs only)
router.get('/', async (req, res) => {
  try {
    const items = await VaultItem.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(items.map(it => ({ id: it._id, ciphertext: it.ciphertext, iv: it.iv, createdAt: it.createdAt })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Update - replace ciphertext+iv for item id
router.put('/:id', async (req, res) => {
  try {
    const { ciphertext, iv } = req.body;
    const id = req.params.id;
    const item = await VaultItem.findOneAndUpdate({ _id: id, userId: req.userId }, { ciphertext, iv }, { new: true });
    if (!item) return res.status(404).json({ error: 'not found' });
    res.json({ id: item._id, updatedAt: item.updatedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const item = await VaultItem.findOneAndDelete({ _id: id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'not found' });
    res.json({ id: item._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
