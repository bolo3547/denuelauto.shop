import { Router } from 'express';

const router = Router();

// Minimal placeholder sales admin endpoints — expand as needed
router.get('/', async (req, res) => {
  res.json({ message: 'Sales admin placeholder' });
});

export default router;
