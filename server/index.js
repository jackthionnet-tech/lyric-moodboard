import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { lyrics, songTitle } = req.body;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Analyze the mood of the following song lyrics from "${songTitle}" and respond with ONLY a valid JSON object — no explanation, no markdown, no code fences. The JSON must have exactly these fields:
- mood: a one-word mood description (e.g. "melancholic", "euphoric", "rebellious")
- summary: a one-sentence vibe description of the song
- keywords: an array of exactly 5 evocative words that capture the feeling
- colors: an array of exactly 3 hex color codes that match the mood (e.g. warm oranges for happy, cool blues for sad)

Lyrics:
${lyrics}`,
        },
      ],
    });

    const analysis = JSON.parse(message.content[0].text);
    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze lyrics' });
  }
});

app.post('/api/patterns', async (req, res) => {
  try {
    const { history } = req.body;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const formatted = history.map(e => ({
      songTitle: e.songTitle,
      mood: e.mood,
      keywords: e.keywords,
      analyzedAt: e.analyzedAt,
    }));

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Here is someone's song analysis history in chronological order. Each entry includes the song title, mood, keywords, and the ISO 8601 timestamp when it was analyzed — use the hour to detect time-of-day patterns.

${JSON.stringify(formatted, null, 2)}

Analyze this listening history and return ONLY a valid JSON object with these fields:
- insight: a 2-3 sentence observation about their overall mood patterns or emotional trends
- timePattern: a one-sentence observation about what time of day they tend to listen to certain moods, or null if there is no clear pattern
- trend: a one-sentence description of how their mood has shifted over time (compare earlier entries to later ones), or null if there is no clear trend
- dominantMood: the single most common mood word across their history`,
        },
      ],
    });

    const patterns = JSON.parse(message.content[0].text);
    res.json(patterns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze patterns' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
