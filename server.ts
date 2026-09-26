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

function formatApiError(err: any): string {
  if (!err) return 'An unexpected error occurred.';
  const raw = typeof err === 'string' ? err : err.message || JSON.stringify(err);
  if (
    raw.includes('429') ||
    raw.includes('RESOURCE_EXHAUSTED') ||
    raw.includes('quota') ||
    raw.includes('limit: 0')
  ) {
    return 'Paid API Key Required: Veo video, Lyria music, and Gemini image models require a paid Google Cloud project with billing enabled. Please select or add a paid API key.';
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // not JSON
  }
  return raw;
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
        error: formatApiError(err),
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
        error: formatApiError(err),
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
        error: formatApiError(err),
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
        error: formatApiError(err),
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

  // ==========================================
  // 4. YOUTUBE VIRAL GROWTH ENGINE
  // Viral Titles, 60s Shorts Scripts, Channel Audit, SEO & Tags
  // Powered by gemini-3.8-flash
  // ==========================================
  app.post('/api/ai/youtube-viral', async (req, res) => {
    try {
      const { action, channelName, niche, topic, style, currentSubscribers, goal } = req.body;

      if (!action) {
        res.status(400).json({ error: 'Action parameter is required.' });
        return;
      }

      const activeTopic = topic || 'Top Trending Tech Gadget Review';
      const activeNiche = niche || 'Tech & Product Reviews';
      const activeChannel = channelName || 'My YouTube Channel';
      const activeStyle = style || 'High Energy & Curiosity Gap';

      // Fallback builder in case Gemini API is not reachable or rate-limited
      const getFallbackData = () => {
        if (action === 'viral-titles') {
          return {
            titles: [
              {
                title: `Don't Buy ${activeTopic} Until You Watch This! (Honest Truth)`,
                ctrScore: 97,
                formulaType: 'Loss Aversion & Warning',
                curiosityTrigger: 'Creates immediate fear of regret or wasting money before buying.',
                hookScript: `"Before you spend your hard-earned money on this, wait! There is one fatal flaw that NO other reviewer is mentioning, and it changed my entire opinion."`,
                thumbnailIdea: 'Split screen: Left side showing the product looking sleek with a green checkmark, right side with a giant red warning sign and your shocked face pointing at it.',
              },
              {
                title: `I Tested ${activeTopic} for 30 Days: Here's What Happened`,
                ctrScore: 94,
                formulaType: 'Long-term Empirical Proof',
                curiosityTrigger: 'Viewers trust 30-day wear-and-tear testing over superficial unboxings.',
                hookScript: `"Everyone reviews this after 24 hours. But after 30 days of everyday abuse, battery drain, and real drops... here is the real truth."`,
                thumbnailIdea: 'Product with visible realistic testing setup, bold yellow text: "DAY 30 DISASTER?", close-up expressive face.',
              },
              {
                title: `$20 vs $500: The ${activeTopic} That Beats Premium Brands`,
                ctrScore: 96,
                formulaType: 'Extreme Price Comparison',
                curiosityTrigger: 'Underdog psychology: viewers are addicted to finding cheap items that beat expensive ones.',
                hookScript: `"Why would anyone pay $500 for this when a $20 alternative just did THIS in our lab test? Let me prove it to you in 60 seconds."`,
                thumbnailIdea: 'Side-by-side battle: $20 budget item on left with fire glow, $500 flagship on right with broken glass effect.',
              },
              {
                title: `99% of People Are Using ${activeTopic} WRONG!`,
                ctrScore: 91,
                formulaType: 'The Secret Knowledge Hack',
                curiosityTrigger: 'Triggers ego and curiosity: viewers need to check if they are making the mistake.',
                hookScript: `"If you own this or plan to buy it, you are probably making the #1 mistake that cuts its performance in half. Watch this simple 5-second fix."`,
                thumbnailIdea: 'Hand pointing at a hidden setting or switch on the device with a red circle and arrow, text: "STOP DOING THIS!"',
              },
              {
                title: `Is ${activeTopic} Actually Worth It In 2026? (Ultimate Verdict)`,
                ctrScore: 89,
                formulaType: 'Search-Dominating Buying Decision',
                curiosityTrigger: 'High search volume: target high-intent buyers ready to click affiliate links.',
                hookScript: `"In 2026, competition is insane. Is this still the king of its category, or is there a brand new competitor you should buy instead?"`,
                thumbnailIdea: 'Clean studio lighting, holding the product up, text: "STILL WORTH IT?", stamp rating: "9.8/10".',
              },
            ],
            strategyTip: 'Always test 2 different thumbnail variants in YouTube Studio test & compare feature. Focus on 3-word bold thumbnail text max!',
          };
        }

        if (action === 'viral-shorts-script') {
          return {
            title: `The 60-Second Viral YouTube Short: ${activeTopic}`,
            estimatedRetention: '88% Average Percentage Viewed',
            targetLength: '45-55 seconds (ideal for YouTube Shorts loop)',
            hook: {
              timestamp: '0:00 - 0:03',
              visualCue: 'Extreme close-up of product in action or dramatic motion (e.g. dropping it, turning it on, fast snap cut). Face looking shocked directly into lens.',
              spokenVoiceover: `"Wait! Stop scrolling, because this one gadget just replaced 3 things on my desk!"`,
              textOnScreen: 'WAIT! DON\'T SCROLL 🚨',
              soundEffectCue: 'Fast whoosh + bass drop impact',
            },
            scenes: [
              {
                timestamp: '0:03 - 0:12',
                section: 'Problem Agitation',
                visualCue: 'Fast-paced B-roll demonstrating the frustrating daily problem everyone faces with standard gear.',
                spokenVoiceover: `"We all hate dealing with bulky chargers, terrible battery, or cheap plastic that breaks in 2 weeks."`,
                textOnScreen: 'EVERYONE HATES THIS ❌',
                soundEffectCue: 'Record scratch / vinyl stop',
              },
              {
                timestamp: '0:12 - 0:28',
                section: 'The Solution & Fast Proof',
                visualCue: 'Quick 3-shot montage: unboxing snap, plugging in, satisfying click. 1.2x speed motion.',
                spokenVoiceover: `"Enter the ${activeTopic}. It gives you studio-grade performance, charges in 10 minutes, and costs under $50."`,
                textOnScreen: 'BEST BUDGET FIND 🏆 ($49 vs $200)',
                soundEffectCue: 'Upbeat phonk / lo-fi pop beat kicks in',
              },
              {
                timestamp: '0:28 - 0:42',
                section: 'The Mind-Blowing Feature',
                visualCue: 'Demonstrate the standout feature in real-time. Macro close-up on details.',
                spokenVoiceover: `"Check this out: when you press this button, it automatically syncs in half a second with zero lag."`,
                textOnScreen: 'WATCH THIS HAPPEN ⚡',
                soundEffectCue: 'Chime / magical sparkle SFX',
              },
              {
                timestamp: '0:42 - 0:50',
                section: 'The Verdict & Value Hook',
                visualCue: 'Product held up proudly with direct eye contact to camera.',
                spokenVoiceover: `"I tested 10 different models this month, and nothing comes close for this price."`,
                textOnScreen: '10/10 MUST-HAVE 🔥',
                soundEffectCue: 'Subtle riser buildup',
              },
            ],
            loopCloser: {
              timestamp: '0:50 - 0:55',
              visualCue: 'Point down toward description / link, then cut straight back to initial motion.',
              spokenVoiceover: `"Grab the verified discount link in my bio or comments before the sale ends, because..."`,
              loopBridgeText: '(Seamlessly connects back to the start: "Wait! Stop scrolling...")',
              textOnScreen: 'LINK IN BIO / PINNED COMMENT 🔗',
              soundEffectCue: 'Quick whoosh connecting to start',
            },
            viralChecklist: [
              'Keep pacing under 1.8 seconds per cut (never stay on one static shot).',
              'Use high-contrast yellow/white subtitle captions on screen (68% watch with sound off).',
              'Pin your affiliate link as the very first pinned comment with fire emojis.',
              'Post between 2 PM and 5 PM creator local time when mobile browsing peaks.',
            ],
          };
        }

        if (action === 'channel-audit') {
          return {
            channelName: activeChannel,
            niche: activeNiche,
            viralHealthScore: 84,
            keyStrengths: [
              'High-commercial intent niche: tech & gadgets have massive affiliate RPMs ($8-$25 CPM).',
              'Clear video demo potential: visual comparisons retain viewers twice as long as talking head videos.',
            ],
            topViralKillers: [
              'Talking intros longer than 5 seconds without showing the actual payoff.',
              'Thumbnails with more than 4 words of text or low contrast lighting.',
              'Inconsistent upload schedule confusing the YouTube recommendation algorithm.',
            ],
            algorithmFormula: {
              targetCTR: '8.5% - 12% (Requires high curiosity gap + clean focal subject in thumbnail)',
              targetAVD: 'Over 65% for 60s Shorts, or Over 50% for 8-12 min longform',
              retentionPacing: 'Cut every 2-3 seconds, use sound effects on every visual transition.',
            },
            sprintPlan30Days: [
              {
                week: 'Week 1: High-Search Foundation',
                focus: 'Capture Search Intent & SEO',
                tasks: [
                  'Publish 2 deep-dive comparison videos ("Product A vs Product B: Which Should You Buy?").',
                  'Post 4 YouTube Shorts highlighting 1 mind-blowing feature each with links in comments.',
                  'Audit all video descriptions with structured affiliate disclaimers & timestamps.',
                ],
              },
              {
                week: 'Week 2: Shorts Pacing Sprint',
                focus: 'Trigger the YouTube Shorts Shelf Algorithm',
                tasks: [
                  'Release 1 high-retention Short daily for 7 consecutive days at 3:00 PM.',
                  'Use seamless loop scripts (first sentence completes last sentence).',
                  'Respond to every comment within 60 minutes to trigger the engagement velocity algorithm.',
                ],
              },
              {
                week: 'Week 3: Controversy & Price Extremes',
                focus: 'Tap into Emotion & Curiosity',
                tasks: [
                  'Film 1 extreme comparison: "$15 Wish Gadget vs $300 Apple/Sony Equivalent".',
                  'Create 3 Shorts showing "Worst Mistakes People Make When Buying X".',
                  'A/B test 2 different thumbnail designs in YouTube Studio for your top video.',
                ],
              },
              {
                week: 'Week 4: Community & Monetization Funnel',
                focus: 'Convert Casual Viewers into Subscribers & Buyers',
                tasks: [
                  'Pin YouTube Community Polls asking viewers what gadget to review next.',
                  'Host a YouTube Live Q&A or live unboxing testing audience questions in real time.',
                  'Pin your storefront website link in all channel header banners & about tab.',
                ],
              },
            ],
            fiveViralVideoIdeas: [
              {
                title: 'The Top 5 Gadgets Under $30 That Feel Like $300',
                concept: 'Rapid-fire showcase of extreme value budget items with live stress-tests.',
                expectedCTR: '11.2%',
              },
              {
                title: 'I Bought Every Trending Tech Gadget on TikTok (Honest Review)',
                concept: 'Busting viral TikTok hype with brutal honesty and real measurements.',
                expectedCTR: '12.8%',
              },
              {
                title: 'Stop Wasting Money on These 5 Overrated Products in 2026',
                concept: 'Contrarian critique that saves viewers money and builds massive credibility.',
                expectedCTR: '10.5%',
              },
              {
                title: 'Is This Cheap Amazon Alternative Actually Better Than The Real Thing?',
                concept: 'Direct benchmark comparison with audio/video/battery tests.',
                expectedCTR: '9.8%',
              },
              {
                title: '10 Secret Features On Your Tech That You Definitely Never Used',
                concept: 'Knowledge hack that makes viewers share the video with friends and family.',
                expectedCTR: '13.4%',
              },
            ],
          };
        }

        // action === 'seo-tags'
        return {
          optimizedTitle: `${activeTopic} Review: Don't Buy Until You See This! (2026)`,
          videoChapters: [
            '00:00 - The Unvarnished Truth About This Gadget',
            '01:15 - Unboxing & First Impressions',
            '03:40 - Real-World Performance & Stress Test',
            '06:20 - Battery Life & Everyday Usability',
            '08:45 - The Fatal Flaw Nobody Talks About',
            '10:30 - Final Verdict: Is It Worth Your Money?',
          ],
          optimizedDescription: `In this video, we rigorously test ${activeTopic} to see if it actually lives up to the viral hype or if it's a complete waste of money.\n\n🔥 Verified Discount Deal Links:\n👉 Check Current Best Price & Promos: https://your-store-url.com#deal\n\n📌 In This Video:\nWe break down the build quality, sound performance, durability, and compare it against top competitors.\n\n⚠️ Affiliate Disclosure: When you purchase through the links above, we may earn a small affiliate commission at no extra cost to you. Thank you for supporting the channel!\n\n#${activeNiche.replace(/\s+/g, '')} #${activeTopic.replace(/\s+/g, '').slice(0, 15)} #ProductReview #TechReview #BestDeals2026`,
          tags: [
            activeTopic,
            `${activeTopic} review`,
            `${activeTopic} test`,
            `${activeTopic} honest review`,
            `${activeTopic} 2026`,
            `best ${activeNiche}`,
            'tech gadgets',
            'budget tech',
            'gadget review',
            'best tech deals',
            'worth it',
            'comparison test',
            'unboxing',
            'buyer guide',
          ],
          hashtags: ['#TechReview', '#HonestReview', '#BestDeals', '#GadgetShowcase', '#ViralTech'],
        };
      };

      // Try generating live data with Gemini gemini-3.8-flash
      try {
        const ai = getGenAI();

        let prompt = '';
        if (action === 'viral-titles') {
          prompt = `You are a world-class YouTube growth strategist who has generated over 500 million views for top tech creators like MrBeast, MKBHD, and Linus Tech Tips.
Generate 5 viral, high-CTR YouTube video titles for the topic: "${activeTopic}" in the niche: "${activeNiche}".
Style / Tone: "${activeStyle}".
Respond with pure JSON matching this exact structure:
{
  "titles": [
    {
      "title": "string (high CTR title under 65 chars)",
      "ctrScore": number (85-99),
      "formulaType": "string (e.g. Extreme Comparison, Loss Aversion, Curiosity Gap)",
      "curiosityTrigger": "string (1-2 sentences on why viewers can't resist clicking)",
      "hookScript": "string (the exact first 5 seconds verbal hook spoken by the creator)",
      "thumbnailIdea": "string (vivid visual description for a high-contrast 16:9 thumbnail)"
    }
  ],
  "strategyTip": "string (1 actionable tip for YouTube title/thumbnail synergy)"
}`;
        } else if (action === 'viral-shorts-script') {
          prompt = `You are a viral YouTube Shorts and TikTok director with over 100M views.
Create a high-retention 50-60 second YouTube Shorts script for "${activeTopic}" in niche "${activeNiche}".
Structure for maximum retention (target 85%+ retention, seamless loop back to start).
Respond with pure JSON matching this exact structure:
{
  "title": "string",
  "estimatedRetention": "string (e.g. 88% Average Percentage Viewed)",
  "targetLength": "string",
  "hook": {
    "timestamp": "0:00 - 0:03",
    "visualCue": "string (what is on camera)",
    "spokenVoiceover": "string (exact words)",
    "textOnScreen": "string (bold hook text)",
    "soundEffectCue": "string (sfx)"
  },
  "scenes": [
    {
      "timestamp": "string (e.g. 0:03 - 0:15)",
      "section": "string (e.g. Problem Agitation, Fast Proof, Standout Feature)",
      "visualCue": "string",
      "spokenVoiceover": "string",
      "textOnScreen": "string",
      "soundEffectCue": "string"
    }
  ],
  "loopCloser": {
    "timestamp": "0:50 - 0:55",
    "visualCue": "string",
    "spokenVoiceover": "string",
    "loopBridgeText": "string (how it loops back into the opening hook)",
    "textOnScreen": "string",
    "soundEffectCue": "string"
  },
  "viralChecklist": ["string", "string", "string", "string"]
}`;
        } else if (action === 'channel-audit') {
          prompt = `You are a YouTube growth algorithm engineer.
Perform an in-depth viral audit and 30-day viral sprint roadmap for:
Channel Name: "${activeChannel}"
Niche: "${activeNiche}"
Current Subs / Scale: "${currentSubscribers || 'Growing creator'}"
Goal: "${goal || '10,000 to 100,000 real subscribers with high affiliate sales'}"

Respond with pure JSON matching this exact structure:
{
  "channelName": "${activeChannel}",
  "niche": "${activeNiche}",
  "viralHealthScore": number (75-95),
  "keyStrengths": ["string", "string"],
  "topViralKillers": ["string", "string", "string"],
  "algorithmFormula": {
    "targetCTR": "string",
    "targetAVD": "string",
    "retentionPacing": "string"
  },
  "sprintPlan30Days": [
    {
      "week": "string (Week 1: ...)",
      "focus": "string",
      "tasks": ["string", "string", "string"]
    }
  ],
  "fiveViralVideoIdeas": [
    {
      "title": "string",
      "concept": "string",
      "expectedCTR": "string"
    }
  ]
}`;
        } else {
          // seo-tags
          prompt = `You are a YouTube SEO expert.
Generate an optimized YouTube video package for:
Topic: "${activeTopic}"
Niche: "${activeNiche}"

Respond with pure JSON matching this exact structure:
{
  "optimizedTitle": "string",
  "videoChapters": ["00:00 - ...", "01:20 - ..."],
  "optimizedDescription": "string (rich description with timestamps, affiliate callouts, and hashtags)",
  "tags": ["string", "string", "string"],
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"]
}`;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        if (rawText) {
          try {
            const parsed = JSON.parse(rawText);
            res.json({
              success: true,
              data: parsed,
              source: 'gemini-3.8-flash',
            });
            return;
          } catch {
            // failed parsing
          }
        }

        // If parsed empty, return structured fallback
        const fallback = getFallbackData();
        res.json({
          success: true,
          data: fallback,
          source: 'curated-viral-engine',
        });
      } catch (genAiError: any) {
        console.warn('Gemini API call failed, serving intelligent viral fallback:', genAiError.message);
        const fallback = getFallbackData();
        res.json({
          success: true,
          data: fallback,
          source: 'curated-viral-engine',
        });
      }
    } catch (err: any) {
      console.error('Error in /api/ai/youtube-viral:', err);
      res.status(500).json({
        error: formatApiError(err),
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
