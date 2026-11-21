import { AlertTriangle, Brain, FolderClock, Bookmark, Zap } from 'lucide-react'
import InputCard from '../components/InputCard'
import Loader from '../components/Loader'
import ResultsDashboard from '../components/ResultsDashboard'

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="glass flex items-center gap-3 !rounded-2xl px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-electric-400">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-display text-xl font-semibold leading-none text-white">{value}</p>
        <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default function Workspace(props) {
  const { loading, error, research, counts } = props
  return (
    <div className="space-y-8">
      <header className="animate-fade-up">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
          <Zap className="h-3.5 w-3.5" /> Powered by local AI
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
          Turn Your Ideas Into <span className="gradient-text">Research</span>
        </h1>
        <p className="mt-3 text-base text-slate-400 sm:text-lg">Your AI-powered academic research assistant.</p>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-xl">
          <Stat icon={Brain} label="Generated" value={counts.history} />
          <Stat icon={Bookmark} label="Saved" value={counts.saved} />
          <Stat icon={FolderClock} label="Sections" value={5} />
        </div>
      </header>

      <InputCard
        form={props.form}
        setForm={props.setForm}
        errors={props.errors}
        setErrors={props.setErrors}
        onGenerate={props.onGenerate}
        onClear={props.onClear}
        loading={loading}
      />

      {error && !loading && (
        <div className="animate-fade-up flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5" role="alert">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
          <div>
            <p className="font-semibold text-rose-100">Couldn't generate research</p>
            <p className="mt-1 text-sm text-rose-200/90">{error}</p>
          </div>
        </div>
      )}

      {loading && <Loader />}

      {!loading && research && (
        <div id="results">
          <ResultsDashboard
            research={research}
            regenerating={props.regenerating}
            onRegenerate={props.onRegenerate}
            onSelectTitle={props.onSelectTitle}
            onSave={props.onSave}
            saved={props.saved}
            toast={props.toast}
          />
        </div>
      )}
    </div>
  )
}
