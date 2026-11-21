"""ResearchMate AI - Smart Research Assistant (Streamlit)."""
from __future__ import annotations

import html
import json
import os
import uuid
from datetime import datetime

import streamlit as st
import streamlit.components.v1 as components

from ai_service import (
    AIServiceError, DEFAULT_GEMINI_MODEL, DEFAULT_OLLAMA_HOST, DEFAULT_OLLAMA_MODEL,
    SECTION_LABELS, SECTIONS, generate_research, regenerate_section, word_count,
)
from pdf_service import build_pdf
from styles import CSS, LOADER_HTML

st.set_page_config(page_title="ResearchMate AI", page_icon="🧠", layout="wide")
st.markdown(CSS, unsafe_allow_html=True)

DOMAINS = ["AI / Machine Learning", "Internet of Things (IoT)", "Web Development",
           "Cybersecurity", "Data Science", "Cloud Computing", "Other"]
LEVELS = ["Beginner", "Intermediate", "Advanced"]
PAGES = {"Dashboard": "🏠  Dashboard", "New Research": "✨  New Research",
         "Research History": "🕘  Research History", "Saved Projects": "⭐  Saved Projects",
         "Settings": "⚙️  Settings"}
ICONS = {"titles": "🎓", "abstract": "📄", "keywords": "🏷️", "objectives": "🎯", "future_enhancements": "🚀"}

# ----------------------------- state ---------------------------------------- #
DEFAULTS = {
    "nav": "Dashboard", "history": [], "current_id": None, "error": None,
    "idea": "", "domain": DOMAINS[0], "tech": "", "level": "Intermediate",
    "provider": "Gemini (cloud)", "gemini_model": DEFAULT_GEMINI_MODEL, "api_key": "",
    "ollama_host": DEFAULT_OLLAMA_HOST, "ollama_model": DEFAULT_OLLAMA_MODEL, "temperature": 0.7,
}
for k, v in DEFAULTS.items():
    st.session_state.setdefault(k, v)
# Streamlit drops widget state for widgets not rendered on a page; re-assign to persist it.
for k in DEFAULTS:
    if k not in ("history", "current_id", "error"):
        st.session_state[k] = st.session_state[k]


def secret(name: str) -> str:
    try:
        return str(st.secrets.get(name, "")) or os.environ.get(name, "")
    except Exception:
        return os.environ.get(name, "")


def ai_cfg() -> dict:
    s = st.session_state
    return {
        "provider": "ollama" if s.provider.startswith("Ollama") else "gemini",
        "api_key": s.api_key.strip() or secret("GEMINI_API_KEY"),
        "gemini_model": s.gemini_model.strip() or secret("GEMINI_MODEL") or DEFAULT_GEMINI_MODEL,
        "ollama_host": s.ollama_host.strip(), "ollama_model": s.ollama_model.strip(),
        "temperature": s.temperature,
    }


def current() -> dict | None:
    return next((e for e in st.session_state.history if e["id"] == st.session_state.current_id), None)


# ----------------------------- helpers -------------------------------------- #
def section_text(key: str, r: dict) -> str:
    if key == "abstract":
        return r["abstract"]
    if key == "keywords":
        return ", ".join(r["keywords"])
    return "\n".join(f"{i}. {t}" for i, t in enumerate(r[key], 1))


def full_text(e: dict) -> str:
    parts = [f"RESEARCHMATE AI - RESEARCH PROPOSAL\nDomain: {e['domain']} | Level: {e['level']} | {e['created']}",
             f"PROJECT IDEA\n{e['idea']}"]
    parts += [f"{SECTION_LABELS[k].upper()}\n{section_text(k, e['result'])}" for k in SECTIONS]
    return "\n\n".join(parts)


def copy_button(text: str, label: str = "Copy", key: str = ""):
    payload = json.dumps(text).replace("<", "\\u003c")  # ensure_ascii + no raw "<": safe inside <script>
    markup = (f"""
    <button id="b" style="width:100%;height:38px;border-radius:14px;border:1px solid rgba(255,255,255,.18);
      background:rgba(255,255,255,.06);color:#e8ecff;font:500 14px Inter,sans-serif;cursor:pointer;transition:all .2s"
      onmouseover="this.style.borderColor='#7c5cff';this.style.boxShadow='0 0 16px rgba(124,92,255,.5)'"
      onmouseout="this.style.borderColor='rgba(255,255,255,.18)';this.style.boxShadow='none'">📋 {label}</button>
    <script>
    const t={payload};
    document.getElementById('b').onclick=async()=>{{
      try{{await navigator.clipboard.writeText(t);}}catch(e){{
        const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();}}
      const b=document.getElementById('b');const o=b.innerHTML;b.innerHTML='✅ Copied!';setTimeout(()=>b.innerHTML=o,1500);
    }};</script>""")
    if hasattr(st, "iframe"):  # newer Streamlit (components.html is being removed)
        st.iframe(markup, height=42)
    else:
        components.html(markup, height=42)


def items_html(items: list[str]) -> str:
    return "".join(f'<div class="rm-item" style="animation-delay:{i*.08}s"><div class="n">{i+1}</div>'
                   f'<div>{html.escape(t)}</div></div>' for i, t in enumerate(items))


# ----------------------------- callbacks ------------------------------------ #
def reset_form():
    for k in ("idea", "tech"):
        st.session_state[k] = ""
    st.session_state.domain, st.session_state.level = DOMAINS[0], "Intermediate"
    st.session_state.current_id = None
    st.session_state.error = None


def on_nav():
    if st.session_state.nav == "New Research":
        reset_form()


def open_entry(eid: str):
    e = next(x for x in st.session_state.history if x["id"] == eid)
    st.session_state.update(current_id=eid, idea=e["idea"], domain=e["domain"], tech=e["tech"],
                            level=e["level"], nav="Dashboard", error=None)


def toggle_save(eid: str):
    for e in st.session_state.history:
        if e["id"] == eid:
            e["saved"] = not e["saved"]


def delete_entry(eid: str):
    st.session_state.history = [e for e in st.session_state.history if e["id"] != eid]
    if st.session_state.current_id == eid:
        st.session_state.current_id = None


# ----------------------------- sidebar -------------------------------------- #
with st.sidebar:
    st.markdown('<div class="rm-logo"><div class="rm-logo-mark">🧠</div>'
                '<div class="rm-logo-text">ResearchMate AI<small>Smart Research Assistant</small></div></div>',
                unsafe_allow_html=True)
    st.radio("Navigation", list(PAGES), format_func=PAGES.get, key="nav",
             label_visibility="collapsed", on_change=on_nav)
    st.divider()
    n_saved = sum(e["saved"] for e in st.session_state.history)
    st.caption(f"📚 {len(st.session_state.history)} researches · ⭐ {n_saved} saved")
    st.caption("Session data lives in your browser session. Export it from Settings to keep it.")


def hero(title: str, sub: str, chip: str = "AI Research Workspace"):
    st.markdown(f'<div class="rm-hero"><div class="rm-chip">✦ {chip}</div><h1>{title}</h1><p>{sub}</p></div>',
                unsafe_allow_html=True)


# ----------------------------- workspace ------------------------------------ #
def run_generation(idea: str):
    s = st.session_state
    slot = st.empty()
    slot.markdown(LOADER_HTML.replace("__MSG__", "ResearchMate is crafting your research proposal…"),
                  unsafe_allow_html=True)
    try:
        result = generate_research(idea, s.domain, s.tech, s.level, ai_cfg())
    except AIServiceError as e:
        s.error = str(e)
        slot.empty()
        return
    except Exception as e:  # noqa: BLE001
        s.error = f"Unexpected error: {e}"
        slot.empty()
        return
    slot.empty()
    entry = {"id": uuid.uuid4().hex[:10], "created": datetime.now().strftime("%d %b %Y, %H:%M"),
             "idea": idea, "domain": s.domain, "tech": s.tech, "level": s.level,
             "result": result, "saved": False}
    s.history.insert(0, entry)
    s.current_id = entry["id"]
    s.error = None


def input_card():
    s = st.session_state
    with st.container(border=True):
        st.markdown('<div class="rm-card-title"><span class="ic">💡</span>Describe Your Project</div>',
                    unsafe_allow_html=True)
        st.text_area("Project Idea", key="idea", height=130, max_chars=1500,
                     placeholder="Describe your project idea in 2–3 lines…  e.g. Detect fake news using machine learning.")
        c1, c2 = st.columns(2)
        c1.selectbox("Domain", DOMAINS, key="domain")
        c2.selectbox("Research Level", LEVELS, key="level")
        st.text_input("Technology preferences (optional)", key="tech",
                      placeholder="e.g. Python, TensorFlow, Raspberry Pi, React")
        b1, b2, _ = st.columns([2, 1.2, 3])
        go = b1.button("⚡ Generate Research", type="primary", use_container_width=True)
        b2.button("🗑 Clear all", on_click=reset_form, use_container_width=True)
        if go:
            idea = s.idea.strip()
            if len(idea) < 15:
                s.error = "Please describe your idea in at least 15 characters (2–3 lines works best)."
            elif len(idea.split()) < 3:
                s.error = "Please use a few more words so the AI can understand your idea."
            else:
                run_generation(idea)
        if s.error:
            st.error(s.error)
            if "Ollama" in s.error or "Gemini" in s.error or "API key" in s.error:
                st.caption("Check the Settings page for provider, model and API key.")


def section_card(e: dict, key: str):
    r = e["result"]
    with st.container(border=True):
        h, c1, c2, c3 = st.columns([3.2, 1.2, 1.2, 1.6], vertical_alignment="center")
        h.markdown(f'<div class="rm-card-title"><span class="ic">{ICONS[key]}</span>{SECTION_LABELS[key]}</div>',
                   unsafe_allow_html=True)
        with c1:
            copy_button(section_text(key, r), "Copy")
        c2.download_button("⬇ TXT", section_text(key, r), file_name=f"{key}.txt",
                           key=f"dl_{key}_{e['id']}", use_container_width=True)
        regen = c3.button("↻ Regenerate", key=f"rg_{key}_{e['id']}", use_container_width=True)
        if key == "abstract":
            st.markdown(f'<div class="rm-abstract">{html.escape(r[key])}</div>'
                        f'<div class="rm-wc">{word_count(r[key])} words</div>', unsafe_allow_html=True)
        elif key == "keywords":
            st.markdown("".join(f'<span class="rm-kw">{html.escape(k)}</span>' for k in r[key]),
                        unsafe_allow_html=True)
        else:
            st.markdown(items_html(r[key]), unsafe_allow_html=True)
        if regen:
            with st.spinner(f"Regenerating {SECTION_LABELS[key].lower()}…"):
                try:
                    e["result"][key] = regenerate_section(key, e["idea"], e["domain"], e["tech"],
                                                          e["level"], e["result"], ai_cfg())
                    st.rerun()
                except AIServiceError as err:
                    st.error(str(err))


def results_dashboard(e: dict):
    st.markdown("### Research Results")
    st.markdown(f'<div class="rm-meta">{html.escape(e["domain"])} · {e["level"]} · {e["created"]}</div>',
                unsafe_allow_html=True)
    a, b, c, d = st.columns(4)
    with a:
        copy_button(full_text(e), "Copy all")
    try:
        pdf = build_pdf(e)
        b.download_button("📥 Download PDF", pdf, file_name="research_proposal.pdf",
                          mime="application/pdf", type="primary", use_container_width=True)
    except Exception as err:  # noqa: BLE001
        b.error(f"PDF error: {err}")
    c.download_button("⬇ Download TXT", full_text(e), file_name="research_proposal.txt",
                      use_container_width=True)
    d.button("⭐ Unsave" if e["saved"] else "☆ Save project", on_click=toggle_save, args=(e["id"],),
             use_container_width=True)
    for key in SECTIONS:
        section_card(e, key)


def workspace(dashboard: bool):
    s = st.session_state
    if dashboard:
        hero("Turn Your Ideas Into Research", "Your AI-powered academic research assistant.")
        cols = st.columns(3)
        stats = [(len(s.history), "Researches"), (sum(x["saved"] for x in s.history), "Saved projects"),
                 (len({x["domain"] for x in s.history}), "Domains explored")]
        for col, (n, label) in zip(cols, stats):
            col.markdown(f'<div class="rm-stat"><b>{n}</b><span>{label}</span></div>', unsafe_allow_html=True)
        st.write("")
    else:
        hero("New Research", "Start from a fresh idea and get a full proposal in seconds.", "New Project")
    input_card()
    e = current()
    if e:
        st.write("")
        results_dashboard(e)


# ----------------------------- pages ---------------------------------------- #
def entry_list(entries: list[dict], empty_msg: str):
    if not entries:
        st.markdown(f'<div class="rm-empty">🔭<br>{empty_msg}</div>', unsafe_allow_html=True)
        return
    for e in entries:
        with st.container(border=True):
            c1, c2 = st.columns([4, 2], vertical_alignment="center")
            c1.markdown(f"**{html.escape(e['result']['titles'][0])}**")
            c1.markdown(f'<div class="rm-meta">{html.escape(e["domain"])} · {e["level"]} · {e["created"]}<br>'
                        f'{html.escape(e["idea"][:140])}{"…" if len(e["idea"]) > 140 else ""}</div>',
                        unsafe_allow_html=True)
            b1, b2, b3 = c2.columns(3)
            b1.button("Open", key=f"o_{e['id']}", on_click=open_entry, args=(e["id"],), use_container_width=True)
            b2.button("⭐" if e["saved"] else "☆", key=f"s_{e['id']}", on_click=toggle_save,
                      args=(e["id"],), use_container_width=True, help="Save / unsave")
            b3.button("🗑", key=f"d_{e['id']}", on_click=delete_entry, args=(e["id"],),
                      use_container_width=True, help="Delete")


def settings_page():
    s = st.session_state
    hero("Settings", "Choose your AI provider and manage your data.", "Configuration")
    with st.container(border=True):
        st.markdown('<div class="rm-card-title"><span class="ic">🤖</span>AI Provider</div>', unsafe_allow_html=True)
        st.radio("Provider", ["Gemini (cloud)", "Ollama (local only)"], key="provider", horizontal=True)
        if s.provider.startswith("Gemini"):
            has_secret = bool(secret("GEMINI_API_KEY"))
            st.text_input("Gemini API key", key="api_key", type="password",
                          placeholder="Using Streamlit secret ✓" if has_secret else "Paste your Gemini API key",
                          help="Get a free key at https://aistudio.google.com/apikey")
            st.text_input("Gemini model", key="gemini_model")
        else:
            st.text_input("Ollama host", key="ollama_host")
            st.text_input("Ollama model", key="ollama_model")
            st.info("Ollama only works when this app runs on the same machine as Ollama "
                    "(not on Streamlit Cloud). Run `ollama pull llama3.2` first.")
        st.slider("Creativity (temperature)", 0.0, 1.2, key="temperature", step=0.1)
    with st.container(border=True):
        st.markdown('<div class="rm-card-title"><span class="ic">💾</span>Your Data</div>', unsafe_allow_html=True)
        st.download_button("Export all research (JSON)", json.dumps(s.history, indent=2),
                           file_name="researchmate_history.json", mime="application/json")
        up = st.file_uploader("Import history (JSON)", type="json")
        if up is not None and st.button("Import now"):
            try:
                data = json.load(up)
                have = {e["id"] for e in s.history}
                s.history += [d for d in data if isinstance(d, dict) and d.get("id") not in have and "result" in d]
                st.success("History imported.")
            except Exception:  # noqa: BLE001
                st.error("That file isn't a valid ResearchMate export.")
        if st.button("Delete all history"):
            s.history, s.current_id = [], None
            st.rerun()


page = st.session_state.nav
if page == "Dashboard":
    workspace(True)
elif page == "New Research":
    workspace(False)
elif page == "Research History":
    hero("Research History", "Every proposal you've generated this session.", "History")
    entry_list(st.session_state.history, "No research yet. Generate your first proposal!")
elif page == "Saved Projects":
    hero("Saved Projects", "Your starred research proposals.", "Saved")
    entry_list([e for e in st.session_state.history if e["saved"]], "Nothing saved yet. Tap ☆ on any research.")
else:
    settings_page()
