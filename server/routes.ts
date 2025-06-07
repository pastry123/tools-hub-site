import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { RemoveBgService } from "./removeBgService";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Remove.bg service
  const removeBgService = new RemoveBgService(process.env.REMOVEBG_API_KEY || '');

  // Background removal endpoint
  app.post('/api/remove-background', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      if (!process.env.REMOVEBG_API_KEY) {
        return res.status(500).json({ error: 'Remove.bg API key not configured' });
      }

      const options = {
        size: (req.body.size as any) || 'auto',
        type: (req.body.type as any) || 'auto',
        format: (req.body.format as any) || 'png',
        crop: req.body.crop === 'true',
        add_shadow: req.body.add_shadow === 'true',
        bg_color: req.body.bg_color || undefined
      };

      const result = await removeBgService.removeBackground(req.file.buffer, options);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        image: result.result_b64,
        credits_charged: result.credits_charged,
        credits_remaining: result.credits_remaining
      });

    } catch (error) {
      console.error('Background removal error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  });

  // Account info endpoint
  app.get('/api/remove-bg/account', async (req, res) => {
    try {
      if (!process.env.REMOVEBG_API_KEY) {
        return res.status(500).json({ error: 'Remove.bg API key not configured' });
      }

      const result = await removeBgService.getAccountInfo();

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        credits: result.credits
      });

    } catch (error) {
      console.error('Account info error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
