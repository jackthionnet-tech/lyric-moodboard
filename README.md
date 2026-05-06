# Lyric Mood Board

Paste any song lyrics and instantly see the emotional vibe — colors, keywords, and a mood summary powered by Claude AI.

## What it does

Lyric Mood Board analyzes the emotional tone of song lyrics using the Claude API and returns a visual mood card. Each card includes a one-word mood, a color palette that matches the feeling, five evocative keywords, and a one-sentence summary of the song's vibe. Results can be shared via a generated URL that renders the card instantly without re-analyzing.

## Tech stack

- **React** (Vite) — frontend UI
- **Node.js + Express** — backend API server
- **Claude API** (claude-sonnet-4-20250514) — lyric analysis and mood generation

## How to run locally

1. Clone the repo and install dependencies:

   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. Add your Anthropic API key to `server/.env`:

   ```
   ANTHROPIC_API_KEY=your-key-here
   ```

3. Start the server (runs on port 3001):

   ```bash
   cd server && npm run dev
   ```

4. Start the client (runs on port 5173):

   ```bash
   cd client && npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## What I learned

- **Full-stack project structure** — how to organize a React frontend and an Express backend as separate apps that communicate over a local API.
- **Integrating a third-party AI API** — how to send structured prompts to Claude, enforce JSON-only responses, and safely parse the output on the server before forwarding it to the client.
- **Environment variable management** — keeping API keys out of source code using `.env` files and `dotenv`, and making sure `.gitignore` covers both `node_modules` and `.env`.
- **Shareable state via URL params** — encoding app state into URL search parameters so results can be bookmarked or shared without a database, and restoring that state on page load.
