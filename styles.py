"""Global CSS: dark navy, purple/electric-blue gradients, glassmorphism, animations."""

CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');
:root{--navy:#0a1024;--p:#7c5cff;--b:#2dd4ff;--glass:rgba(255,255,255,.05);--bd:rgba(255,255,255,.12);--mut:#9aa6d6}
html,body,[class*="css"],.stApp{font-family:'Inter',sans-serif}
h1,h2,h3,.rm-display{font-family:'Space Grotesk',sans-serif!important;letter-spacing:-.02em}
#MainMenu,footer,[data-testid="stToolbar"],[data-testid="stDecoration"]{visibility:hidden;height:0}
header[data-testid="stHeader"]{background:transparent}
.stApp{background:
  radial-gradient(900px 500px at 85% -10%,rgba(124,92,255,.28),transparent 60%),
  radial-gradient(700px 500px at -10% 40%,rgba(45,212,255,.16),transparent 60%),
  linear-gradient(180deg,#0a1024 0%,#070b1a 100%);background-attachment:fixed}
.block-container{padding-top:2rem;max-width:1150px}

/* Sidebar */
[data-testid="stSidebar"]{background:rgba(12,18,44,.75);backdrop-filter:blur(18px);border-right:1px solid var(--bd)}
.rm-logo{display:flex;align-items:center;gap:12px;margin:4px 0 22px}
.rm-logo-mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;font-size:22px;
  background:linear-gradient(135deg,var(--p),var(--b));box-shadow:0 0 24px rgba(124,92,255,.6);animation:pulse 3s ease-in-out infinite}
.rm-logo-text{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.2rem;line-height:1.1;color:#fff}
.rm-logo-text small{display:block;font-family:Inter;font-weight:500;font-size:.68rem;color:var(--mut);letter-spacing:.12em;text-transform:uppercase}
[data-testid="stSidebar"] [role="radiogroup"]{gap:6px}
[data-testid="stSidebar"] [role="radiogroup"] label{background:transparent;border:1px solid transparent;border-radius:12px;
  padding:10px 14px;width:100%;transition:all .25s ease;cursor:pointer}
[data-testid="stSidebar"] [role="radiogroup"] label:hover{background:var(--glass);border-color:var(--bd);transform:translateX(3px)}
[data-testid="stSidebar"] [role="radiogroup"] label:has(input:checked){
  background:linear-gradient(135deg,rgba(124,92,255,.35),rgba(45,212,255,.18));border-color:rgba(124,92,255,.6);
  box-shadow:0 0 18px rgba(124,92,255,.3)}
[data-testid="stSidebar"] [role="radiogroup"] label>div:first-child{display:none}

/* Hero */
.rm-hero{margin-bottom:1.4rem;animation:fadeUp .7s ease both}
.rm-hero h1{font-size:clamp(1.9rem,4.5vw,3rem);margin:0;font-weight:700;
  background:linear-gradient(90deg,#fff 0%,#b9a8ff 45%,var(--b) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.rm-hero p{color:var(--mut);font-size:1.05rem;margin:.4rem 0 0}
.rm-chip{display:inline-block;padding:4px 12px;border-radius:99px;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;
  border:1px solid var(--bd);background:var(--glass);color:#cfd6ff;margin-bottom:.8rem}

/* Glass cards (bordered containers) */
[data-testid="stVerticalBlockBorderWrapper"]{background:var(--glass);border:1px solid var(--bd)!important;border-radius:20px!important;
  backdrop-filter:blur(16px);box-shadow:0 10px 40px rgba(0,0,0,.35);padding:.4rem .5rem;animation:fadeUp .6s ease both;
  transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}
[data-testid="stVerticalBlockBorderWrapper"]:hover{border-color:rgba(124,92,255,.45)!important;box-shadow:0 14px 50px rgba(124,92,255,.18)}
.rm-card-title{display:flex;align-items:center;gap:10px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:1.1rem;color:#fff}
.rm-card-title span.ic{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;
  background:linear-gradient(135deg,var(--p),var(--b));font-size:16px}

/* Inputs */
.stTextArea textarea,.stTextInput input,.stSelectbox div[data-baseweb="select"]>div,.stNumberInput input{
  background:rgba(8,13,34,.7)!important;border:1px solid var(--bd)!important;border-radius:14px!important;color:#e8ecff!important;transition:all .25s}
.stTextArea textarea:focus,.stTextInput input:focus{border-color:var(--p)!important;box-shadow:0 0 0 3px rgba(124,92,255,.25)!important}
label,.stMarkdown p{color:#d5dbff}
[data-testid="stWidgetLabel"] p{font-weight:500;color:#cfd6ff}

/* Buttons */
.stButton>button,.stDownloadButton>button{border-radius:14px;border:1px solid var(--bd);background:var(--glass);color:#e8ecff;
  transition:all .25s ease;font-weight:500}
.stButton>button:hover,.stDownloadButton>button:hover{border-color:var(--p);color:#fff;transform:translateY(-2px);box-shadow:0 0 18px rgba(124,92,255,.4)}
.stButton>button[kind="primary"],.stDownloadButton>button[kind="primary"]{border:none;color:#fff;font-weight:600;padding:.65rem 1.4rem;
  background:linear-gradient(135deg,var(--p),#4f7bff 55%,var(--b));background-size:200% 200%;
  box-shadow:0 0 26px rgba(124,92,255,.55);animation:glow 3.2s ease-in-out infinite,gradShift 6s ease infinite}
.stButton>button[kind="primary"]:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 0 38px rgba(45,212,255,.6)}

/* Content blocks */
.rm-item{display:flex;gap:12px;padding:12px 14px;margin:8px 0;border-radius:14px;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.07);animation:fadeUp .5s ease both;line-height:1.55}
.rm-item .n{flex:none;width:26px;height:26px;border-radius:8px;display:grid;place-items:center;font-size:.8rem;font-weight:700;
  background:linear-gradient(135deg,var(--p),var(--b));color:#fff}
.rm-abstract{line-height:1.8;color:#dfe4ff;text-align:justify}
.rm-wc{color:var(--mut);font-size:.8rem;margin-top:8px}
.rm-kw{display:inline-block;margin:5px 6px 5px 0;padding:7px 15px;border-radius:99px;font-size:.88rem;font-weight:500;color:#fff;
  background:linear-gradient(135deg,rgba(124,92,255,.45),rgba(45,212,255,.25));border:1px solid rgba(124,92,255,.55);transition:transform .2s}
.rm-kw:hover{transform:translateY(-2px) scale(1.04)}
.rm-stat{padding:16px 18px;border-radius:18px;background:var(--glass);border:1px solid var(--bd);animation:fadeUp .6s ease both}
.rm-stat b{display:block;font-family:'Space Grotesk',sans-serif;font-size:1.8rem;background:linear-gradient(90deg,#fff,var(--b));-webkit-background-clip:text;background-clip:text;color:transparent}
.rm-stat span{color:var(--mut);font-size:.8rem;text-transform:uppercase;letter-spacing:.08em}
.rm-meta{color:var(--mut);font-size:.82rem}
.rm-empty{text-align:center;padding:42px 10px;color:var(--mut)}

/* Loader */
.rm-loader{display:flex;flex-direction:column;align-items:center;gap:16px;padding:34px 0}
.rm-orb{width:62px;height:62px;border-radius:50%;border:3px solid rgba(255,255,255,.1);border-top-color:var(--b);border-right-color:var(--p);
  animation:spin 1s linear infinite;box-shadow:0 0 30px rgba(124,92,255,.5)}
.rm-bars{display:flex;gap:5px;align-items:flex-end;height:22px}
.rm-bars i{width:5px;border-radius:3px;background:linear-gradient(var(--b),var(--p));animation:bar 1s ease-in-out infinite}
.rm-bars i:nth-child(2){animation-delay:.12s}.rm-bars i:nth-child(3){animation-delay:.24s}.rm-bars i:nth-child(4){animation-delay:.36s}.rm-bars i:nth-child(5){animation-delay:.48s}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes bar{0%,100%{height:6px}50%{height:22px}}
@keyframes pulse{0%,100%{box-shadow:0 0 18px rgba(124,92,255,.5)}50%{box-shadow:0 0 34px rgba(45,212,255,.7)}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(124,92,255,.5)}50%{box-shadow:0 0 38px rgba(45,212,255,.65)}}
@keyframes gradShift{0%,100%{background-position:0 50%}50%{background-position:100% 50%}}

@media(max-width:768px){.block-container{padding:1rem .8rem}.rm-hero p{font-size:.95rem}.rm-item{padding:10px}}
</style>
"""

LOADER_HTML = """
<div class="rm-loader"><div class="rm-orb"></div>
<div class="rm-bars"><i></i><i></i><i></i><i></i><i></i></div>
<div style="color:#b9c3ff">__MSG__</div></div>
"""
