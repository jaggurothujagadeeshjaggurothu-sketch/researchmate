# ResearchMate AI – Smart Research Assistant (Streamlit)

Turn a rough project idea into 3 academic titles, a 150–200 word abstract, 5 keywords,
3 measurable objectives and 3 future enhancements. Dark-navy glassmorphism UI, per-section
copy / download / regenerate, one-click PDF export, history, saved projects and validation of
every AI response.

```
researchmate-ai/
├── frontend/ + backend/   # OPTIONAL full-stack edition (React/Vite + FastAPI) – see below
├── app.py            # Streamlit UI (pages, cards, state)
├── ai_service.py     # System prompt, Gemini + Ollama calls, JSON validation, retries
├── pdf_service.py    # PDF export (fpdf2)
├── styles.py         # CSS + animations + loader
├── requirements.txt
└── .streamlit/       # config.toml (theme), secrets.toml.example
```

## Run locally
```bash
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
mkdir -p .streamlit && cp .streamlit/secrets.toml.example .streamlit/secrets.toml
# edit secrets.toml and paste your Gemini key (free: https://aistudio.google.com/apikey)
streamlit run app.py
```
Open http://localhost:8501. (You can also paste the key in **Settings** instead of using secrets.)

## Deploy on Streamlit Community Cloud
1. Push this folder to a GitHub repo (`.gitignore` already excludes `secrets.toml`).
2. Go to https://share.streamlit.io → **New app** → pick the repo, branch, main file `app.py`.
3. **Advanced settings → Secrets**, paste:
   ```toml
   GEMINI_API_KEY = "your-gemini-api-key"
   ```
4. Deploy. 

## Optional: local Ollama (llama3.2)
Works only when the app runs on the same machine as Ollama (not on Streamlit Cloud).
```bash
ollama pull llama3.2 && ollama serve
```
Then Settings → Provider → **Ollama (local only)**. Endpoint: `POST http://localhost:11434/api/chat`, `format: json`, `stream: false`.

## How it works
- The system prompt lives in `ai_service.py` (`SYSTEM_PROMPT`). Gemini is called with `responseMimeType: application/json`.
- Output is validated (3 unique titles, 150–200 word abstract, 5 keywords, 3 objectives, 3 enhancements). Invalid output is retried up to 3× with the problems fed back.
- Regenerating a section re-prompts for only that section, with the existing content as context.

## Troubleshooting
| Problem | Fix |
|---|---|
| "No Gemini API key found" | Add `GEMINI_API_KEY` to secrets or Settings. |
| Gemini 400 / 403 | Key invalid or not enabled for the model. |
| Gemini 404 | Model name changed – set another in Settings (e.g. `gemini-2.5-flash`). |
| Gemini 429 | Free-tier rate limit; wait a minute. |
| "Cannot connect to Ollama" | Run `ollama serve`; Ollama can't be reached from Streamlit Cloud. |
| "Model llama3.2 is not installed" | `ollama pull llama3.2`. |
| "failed validation" | Click Generate again, or lower the creativity slider. |
| Copy button does nothing | Browser blocked the clipboard; the TXT/PDF downloads still work. |
| History disappears | History is per browser session (shared-hosting safe). Use Settings → Export / Import. |

AI-generated drafts: review and verify before academic submission.

## Optional: full-stack edition (React + FastAPI)
`frontend/` (React, Tailwind, Lucide) and `backend/` (FastAPI) are a separate edition for running on your own machine/server;
Streamlit Cloud only runs `app.py`.
```bash
cd backend && pip install -r requirements.txt && cp config.example.toml config.toml   # add your Gemini key
uvicorn main:app --reload --port 8000
cd ../frontend && npm install && npm run dev       # http://localhost:5173
```
