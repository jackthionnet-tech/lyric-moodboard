import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
