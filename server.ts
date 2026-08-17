import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface CardData {
  slug: string;
  fullName: string;
  title: string;
  company: string;
  phone?: string;
  email?: string;
  website?: string;
  photo?: string;
  theme?: string;
  socials?: Array<{ platform: string; value: string; onCard: boolean }>;
  scans?: number;
  createdAt?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CARDS_FILE = path.join(DATA_DIR, 'cards.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data dir', e);
  }
}

// In-memory store initialized from disk
const cardsStore: Record<string, CardData> = {};

function loadCardsFromDisk() {
  try {
    if (fs.existsSync(CARDS_FILE)) {
      const raw = fs.readFileSync(CARDS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      Object.assign(cardsStore, parsed);
      console.log(`[Server] Loaded ${Object.keys(cardsStore).length} cards from storage.`);
    }
  } catch (err) {
    console.error('[Server] Failed reading cards from disk', err);
  }
}

function persistCardsToDisk() {
  try {
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cardsStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed persisting cards to disk', err);
  }
}

loadCardsFromDisk();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', cardsCount: Object.keys(cardsStore).length });
  });

  // Get Card by Slug
  app.get('/api/cards/:slug', (req, res) => {
    const slug = req.params.slug;
    const card = cardsStore[slug];
    if (card) {
      res.json({ success: true, card });
    } else {
      res.status(404).json({ success: false, message: 'Card not found' });
    }
  });

  // Save / Publish Card
  app.post('/api/cards', (req, res) => {
    const body = req.body as CardData;
    if (!body || !body.slug) {
      res.status(400).json({ success: false, message: 'Missing card slug or payload' });
      return;
    }

    const existing = cardsStore[body.slug];
    const updated: CardData = {
      ...body,
      scans: existing?.scans ?? body.scans ?? 0,
      createdAt: body.createdAt || existing?.createdAt || new Date().toISOString(),
    };

    cardsStore[body.slug] = updated;
    persistCardsToDisk();

    res.json({ success: true, card: updated });
  });

  // Increment Scan count
  app.post('/api/cards/:slug/scan', (req, res) => {
    const slug = req.params.slug;
    if (cardsStore[slug]) {
      cardsStore[slug].scans = (cardsStore[slug].scans || 0) + 1;
      persistCardsToDisk();
      res.json({ success: true, scans: cardsStore[slug].scans });
    } else {
      res.json({ success: true, scans: 1 });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
