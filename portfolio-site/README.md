# Portfolio Builder

A form-based portfolio generator with AI-assisted copy polishing.

## Run it locally

```
npm install
npm run dev
```

Note: the AI polish button won't work locally unless you also run Netlify's
local dev server (`netlify dev` after installing the Netlify CLI), since it
needs the serverless function in `netlify/functions/polish.js`.

## Deploy it for real

1. Push this whole folder to a GitHub repository.
2. Go to https://app.netlify.com, sign up, and "Add new site" -> "Import an
   existing project" -> connect your GitHub repo.
3. Netlify will detect `netlify.toml` automatically (build command
   `npm run build`, publish folder `dist`).
4. In Site settings -> Environment variables, add:
   `ANTHROPIC_API_KEY` = your key from https://console.anthropic.com
5. Deploy. Your site goes live at a `*.netlify.app` URL immediately.
6. (Optional) Add a custom domain under Domain settings.

## Cost

Netlify's free tier covers hosting and functions for a small site like this.
The only ongoing cost is the Anthropic API usage — a few pence per AI polish,
billed to your Anthropic account.
