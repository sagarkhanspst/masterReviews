import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please add your Gemini API key in AI Studio Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Strip data URI header if passed (e.g. data:image/png;base64,...)
function stripBase64Header(b64: string): { data: string; mimeType: string } {
  const match = b64.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/jpeg', data: b64 };
}

async function startServer() {
  const app = express();

  // Allow larger payload for images/audio uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // ==========================================
  // 1. MUSIC GENERATION (Lyria)
  // lyria-3-clip-preview (up to 30s) or lyria-3-pro-preview (full tracks)
  // ==========================================
  app.post('/api/ai/generate-music', async (req, res) => {
    try {
      const { prompt, model, imageBase64, imageMimeType } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required for music generation.' });
        return;
      }

      const targetModel = model === 'lyria-3-pro-preview' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';
      const ai = getGenAI();

      let contents: any;
      if (imageBase64) {
        const { data: cleanB64, mimeType: detectedMime } = stripBase64Header(imageBase64);
        contents = {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanB64,
                mimeType: imageMimeType || detectedMime || 'image/jpeg',
              },
            },
          ],
        };
      } else {
        contents = prompt;
      }

      const responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents,
      });

      let audioBase64 = '';
      let lyrics = '';
      let mimeType = 'audio/wav';

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (!audioBase64) {
        res.status(500).json({ error: 'Music model generated an empty audio track. Please try a different music prompt.' });
        return;
      }

      res.json({
        success: true,
        model: targetModel,
        audioBase64,
        mimeType,
        lyrics,
        durationMode: targetModel === 'lyria-3-pro-preview' ? 'full-track' : '30s-clip',
      });
    } catch (err: any) {
      console.error('Error in /api/ai/generate-music:', err);
      res.status(500).json({
        error: err.message || 'Failed to generate music.',
        code: err.status || err.code || 'GENERATION_FAILED',
      });
    }
  });

  // ==========================================
  // 2. CREATE & EDIT IMAGES (gemini-3.1-flash-image-preview)
  // Text prompt to create, or text prompt + photo to edit
  // ==========================================
  app.post('/api/ai/create-image', async (req, res) => {
    try {
      const { prompt, editImageBase64, editImageMimeType, aspectRatio } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'A text prompt is required.' });
        return;
      }

      const ai = getGenAI();
      const primaryModel = 'gemini-3.1-flash-image-preview';
      const fallbackModel = 'gemini-3.1-flash-image';

      const validAspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
      const chosenAspect = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

      let parts: any[] = [];
      if (editImageBase64) {
        const { data: cleanB64, mimeType: detectedMime } = stripBase64Header(editImageBase64);
        parts.push({
          inlineData: {
            data: cleanB64,
            mimeType: editImageMimeType || detectedMime || 'image/jpeg',
          },
        });
      }
      parts.push({ text: prompt });

      let response: any;
      try {
        response = await ai.models.generateContent({
          model: primaryModel,
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: chosenAspect as any,
              imageSize: '1K',
            },
          },
        });
      } catch (primaryErr: any) {
        console.warn(`Primary model ${primaryModel} failed, trying fallback ${fallbackModel}:`, primaryErr.message);
        response = await ai.models.generateContent({
          model: fallbackModel,
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: chosenAspect as any,
              imageSize: '1K',
            },
          },
        });
      }

      let imageBase64 = '';
      let mimeType = 'image/png';
      let caption = '';

      const returnedParts = response?.candidates?.[0]?.content?.parts || [];
      for (const p of returnedParts) {
        if (p.inlineData?.data) {
          imageBase64 = p.inlineData.data;
          if (p.inlineData.mimeType) {
            mimeType = p.inlineData.mimeType;
          }
          break;
        } else if (p.text) {
          caption += p.text;
        }
      }

      if (!imageBase64) {
        res.status(500).json({
          error: caption || 'Model did not return an image. Try refining your prompt description.',
        });
        return;
      }

      res.json({
        success: true,
        imageBase64,
        mimeType,
        caption,
        aspectRatio: chosenAspect,
        isEdit: Boolean(editImageBase64),
      });
    } catch (err: any) {
      console.error('Error in /api/ai/create-image:', err);
      res.status(500).json({
        error: err.message || 'Failed to generate/edit image.',
        code: err.status || err.code || 'IMAGE_GEN_FAILED',
      });
    }
  });

  // ==========================================
  // 3. ANIMATE IMAGES INTO VIDEO (Veo)
  // Photo upload + Veo video generations using veo-3.1-fast-generate-preview
  // Aspect ratio 16:9 (landscape) or 9:16 (portrait)
  // ==========================================

  // Step 1: Start video generation
  app.post('/api/ai/generate-video', async (req, res) => {
    try {
      const { imageBase64, imageMimeType, prompt, aspectRatio, resolution } = req.body;
      if (!imageBase64) {
        res.status(400).json({ error: 'A photo is required to animate into video.' });
        return;
      }

      const { data: cleanB64, mimeType: detectedMime } = stripBase64Header(imageBase64);
      const chosenAspect: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
      const chosenRes: '720p' | '1080p' = resolution === '1080p' ? '1080p' : '720p';

      const ai = getGenAI();
      const primaryModel = 'veo-3.1-fast-generate-preview';
      const fallbackModel = 'veo-3.1-lite-generate-preview';

      let operation: any;
      try {
        operation = await ai.models.generateVideos({
          model: primaryModel,
          prompt: prompt || 'Smooth cinematic product animation, clean lighting, slow orbital motion',
          image: {
            imageBytes: cleanB64,
            mimeType: imageMimeType || detectedMime || 'image/jpeg',
          },
          config: {
            numberOfVideos: 1,
            resolution: chosenRes,
            aspectRatio: chosenAspect,
          },
        });
      } catch (primaryErr: any) {
        console.warn(`Primary model ${primaryModel} failed, trying fallback ${fallbackModel}:`, primaryErr.message);
        operation = await ai.models.generateVideos({
          model: fallbackModel,
          prompt: prompt || 'Smooth cinematic product animation, clean lighting, slow orbital motion',
          image: {
            imageBytes: cleanB64,
            mimeType: imageMimeType || detectedMime || 'image/jpeg',
          },
          config: {
            numberOfVideos: 1,
            resolution: chosenRes,
            aspectRatio: chosenAspect,
          },
        });
      }

      res.json({
        success: true,
        operationName: operation.name,
        aspectRatio: chosenAspect,
        resolution: chosenRes,
      });
    } catch (err: any) {
      console.error('Error in /api/ai/generate-video:', err);
      res.status(500).json({
        error: err.message || 'Failed to initiate video generation.',
        code: err.status || err.code || 'VIDEO_INIT_FAILED',
      });
    }
  });

  // Step 2: Poll operation status
  app.post('/api/ai/video-status', async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        res.status(400).json({ error: 'operationName is required' });
        return;
      }

      const ai = getGenAI();
      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });
      const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri;

      res.json({
        done: Boolean(updated.done),
        hasVideo: Boolean(videoUri),
        error: updated.error || null,
      });
    } catch (err: any) {
      console.error('Error in /api/ai/video-status:', err);
      res.status(500).json({
        error: err.message || 'Failed to poll video status.',
      });
    }
  });

  // Step 3: Fetch generated video and return as downloadable mp4 stream or base64
  app.post('/api/ai/video-download', async (req, res) => {
    try {
      const { operationName, returnBase64 } = req.body;
      if (!operationName) {
        res.status(400).json({ error: 'operationName is required' });
        return;
      }

      const ai = getGenAI();
      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        res.status(400).json({ error: 'Video is not yet ready or generation failed.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey! },
      });

      if (!videoRes.ok) {
        throw new Error(`Failed to fetch video payload from storage: ${videoRes.statusText}`);
      }

      const buffer = Buffer.from(await videoRes.arrayBuffer());

      if (returnBase64) {
        res.json({
          success: true,
          videoBase64: buffer.toString('base64'),
          mimeType: 'video/mp4',
        });
        return;
      }

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename="generated-review-video.mp4"');
      res.send(buffer);
    } catch (err: any) {
      console.error('Error in /api/ai/video-download:', err);
      res.status(500).json({
        error: err.message || 'Failed to download generated video.',
      });
    }
  });

  // Vite middleware in development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
