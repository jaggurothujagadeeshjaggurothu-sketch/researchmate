"""AI service layer for ResearchMate AI.

Supports Google Gemini (cloud, default - works on Streamlit Community Cloud)
and Ollama (local llama3.2 - works only when Ollama runs on the same machine).
"""
from __future__ import annotations

import json
import re
from typing import Any

import requests

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
DEFAULT_OLLAMA_HOST = "http://localhost:11434"
DEFAULT_OLLAMA_MODEL = "llama3.2"

SYSTEM_PROMPT = """You are ResearchMate AI, an expert academic research assistant.
Your job is to transform rough student project ideas into professional academic research content.
Generate:
1. Three unique academic research titles.
2. One abstract between 150 and 200 words.
3. Exactly five keywords.
4. Exactly three measurable research objectives.
5. Exactly three possible future enhancements.
Maintain academic quality, clarity, originality, and relevance to the selected domain.
Do not invent experimental results, citations, datasets, or proven outcomes. Clearly distinguish proposed methods and expected results from completed research.
The abstract must cover background, problem statement, proposed methodology, expected outcomes and significance, in formal academic English, and must be 150-200 words (aim for about 175).
Return valid JSON only using the following structure:
{
"titles": ["Title 1", "Title 2", "Title 3"],
"abstract": "150-200 word academic abstract",
"keywords": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5"],
"objectives": ["Objective 1", "Objective 2", "Objective 3"],
"future_enhancements": ["Enhancement 1", "Enhancement 2", "Enhancement 3"]
}"""

SECTIONS = ["titles", "abstract", "keywords", "objectives", "future_enhancements"]
COUNTS = {"titles": 3, "keywords": 5, "objectives": 3, "future_enhancements": 3}
SECTION_LABELS = {
    "titles": "Research Title Options",
    "abstract": "Abstract",
    "keywords": "Keywords",
    "objectives": "Research Objectives",
    "future_enhancements": "Future Enhancements",
}


class AIServiceError(Exception):
    """User-presentable error from the AI layer."""


# --------------------------------------------------------------------------- #
# Validation
# --------------------------------------------------------------------------- #
def word_count(text: str) -> int:
    return len(text.split())


def _clean_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(v).strip() for v in value if str(v).strip()]


def validate_result(data: Any, sections: list[str] | None = None) -> tuple[dict, list[str]]:
    """Return (normalised_data, problems). Empty problems => valid."""
    sections = sections or SECTIONS
    problems: list[str] = []
    out: dict = {}
    if not isinstance(data, dict):
        return {}, ["Response was not a JSON object."]
    for key in sections:
        if key not in data:
            problems.append(f'Missing key "{key}".')
            continue
        if key == "abstract":
            text = data[key]
            if isinstance(text, list):
                text = " ".join(str(t) for t in text)
            text = re.sub(r"\s+", " ", str(text)).strip()
            n = word_count(text)
            if not 150 <= n <= 200:
                problems.append(f"Abstract has {n} words; it must be between 150 and 200.")
            out[key] = text
        else:
            items = _clean_list(data[key])
            if len(items) != COUNTS[key]:
                problems.append(f'"{key}" has {len(items)} items; it must have exactly {COUNTS[key]}.')
            if key == "titles" and len({t.lower() for t in items}) != len(items):
                problems.append("Titles must be unique.")
            out[key] = items
    return out, problems


def extract_json(text: str) -> Any:
    text = (text or "").strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.I)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                pass
    raise AIServiceError("The model did not return valid JSON. Please try again.")


# --------------------------------------------------------------------------- #
# Providers
# --------------------------------------------------------------------------- #
def _call_gemini(system: str, user: str, *, api_key: str, model: str, temperature: float = 0.7) -> str:
    if not api_key:
        raise AIServiceError(
            "No Gemini API key found. Add it in Settings, or set GEMINI_API_KEY in Streamlit secrets."
        )
    payload = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": user}]}],
        "generationConfig": {
            "temperature": temperature,
            "responseMimeType": "application/json",
            "maxOutputTokens": 4096,
        },
    }
    try:
        r = requests.post(
            GEMINI_URL.format(model=model),
            json=payload,
            headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
            timeout=120,
        )
    except requests.exceptions.Timeout:
        raise AIServiceError("Gemini request timed out. Please try again.")
    except requests.exceptions.RequestException as e:
        raise AIServiceError(f"Could not reach the Gemini API: {e}")

    if r.status_code != 200:
        try:
            msg = r.json().get("error", {}).get("message", r.text)
        except ValueError:
            msg = r.text
        hints = {
            400: "Check that your API key is valid.",
            403: "The API key is not permitted to use this model.",
            404: f'Model "{model}" was not found. Change it in Settings.',
            429: "Quota or rate limit reached. Wait a moment and retry.",
        }
        raise AIServiceError(f"Gemini error {r.status_code}: {msg} {hints.get(r.status_code, '')}".strip())

    data = r.json()
    block = data.get("promptFeedback", {}).get("blockReason")
    if block:
        raise AIServiceError(f"Gemini blocked the prompt ({block}). Rephrase your idea.")
    try:
        parts = data["candidates"][0]["content"]["parts"]
        return "".join(p.get("text", "") for p in parts)
    except (KeyError, IndexError, TypeError):
        raise AIServiceError("Gemini returned an empty response. Please try again.")


def _call_ollama(system: str, user: str, *, host: str, model: str, temperature: float = 0.7) -> str:
    url = host.rstrip("/") + "/api/chat"
    payload = {
        "model": model,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "stream": False,
        "format": "json",
        "options": {"temperature": temperature},
    }
    try:
        r = requests.post(url, json=payload, timeout=180)
    except requests.exceptions.ConnectionError:
        raise AIServiceError(
            f"Cannot connect to Ollama at {host}. Start it with `ollama serve`. "
            "Note: Ollama is not reachable from Streamlit Cloud - use Gemini there."
        )
    except requests.exceptions.Timeout:
        raise AIServiceError("Ollama timed out. The model may still be loading - try again.")
    if r.status_code == 404:
        raise AIServiceError(f'Model "{model}" is not installed. Run: ollama pull {model}')
    if r.status_code != 200:
        raise AIServiceError(f"Ollama error {r.status_code}: {r.text[:200]}")
    try:
        return r.json()["message"]["content"]
    except (KeyError, ValueError):
        raise AIServiceError("Unexpected response format from Ollama.")


def _complete(system: str, user: str, cfg: dict) -> str:
    temp = float(cfg.get("temperature", 0.7))
    if cfg.get("provider") == "ollama":
        return _call_ollama(
            system, user,
            host=cfg.get("ollama_host") or DEFAULT_OLLAMA_HOST,
            model=cfg.get("ollama_model") or DEFAULT_OLLAMA_MODEL,
            temperature=temp,
        )
    return _call_gemini(
        system, user,
        api_key=cfg.get("api_key", ""),
        model=cfg.get("gemini_model") or DEFAULT_GEMINI_MODEL,
        temperature=temp,
    )


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #
def _context(idea: str, domain: str, tech: str, level: str) -> str:
    lines = [f"Project idea: {idea.strip()}", f"Domain: {domain}", f"Research level: {level}"]
    if tech.strip():
        lines.append(f"Technology preferences: {tech.strip()}")
    return "\n".join(lines)


def _run_validated(system: str, user: str, cfg: dict, sections: list[str], attempts: int = 3) -> dict:
    feedback = ""
    last_problems: list[str] = []
    for _ in range(attempts):
        raw = _complete(system, user + feedback, cfg)
        try:
            data, problems = validate_result(extract_json(raw), sections)
        except AIServiceError as e:
            data, problems = {}, [str(e)]
        if not problems:
            return data
        last_problems = problems
        feedback = "\n\nYour previous answer was rejected: " + " ".join(problems) + " Fix this and return JSON only."
    raise AIServiceError("The AI output failed validation after several attempts: " + " ".join(last_problems))


def generate_research(idea: str, domain: str, tech: str, level: str, cfg: dict) -> dict:
    user = _context(idea, domain, tech, level) + "\n\nGenerate the research content now."
    return _run_validated(SYSTEM_PROMPT, user, cfg, SECTIONS)


def regenerate_section(section: str, idea: str, domain: str, tech: str, level: str,
                       current: dict, cfg: dict) -> Any:
    if section not in SECTIONS:
        raise AIServiceError(f"Unknown section: {section}")
    rules = {
        "titles": "exactly 3 unique academic titles, different from the existing ones",
        "abstract": "one abstract of 150-200 words, different in wording from the existing one",
        "keywords": "exactly 5 keywords",
        "objectives": "exactly 3 clear, measurable objectives",
        "future_enhancements": "exactly 3 realistic future enhancements",
    }[section]
    user = (
        _context(idea, domain, tech, level)
        + f"\n\nExisting content (for consistency, do not copy):\n{json.dumps(current, ensure_ascii=False)}"
        + f'\n\nRegenerate ONLY "{section}": {rules}. Return JSON with the single key "{section}".'
    )
    system = SYSTEM_PROMPT + f'\nFor this request return ONLY the key "{section}".'
    return _run_validated(system, user, cfg, [section])[section]
