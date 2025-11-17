import { useState } from 'react'

function imgFromHex(hex){
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b=>parseInt(b,16)))
  const blob = new Blob([bytes], { type: 'image/png' })
  return URL.createObjectURL(blob)
}

export default function Plots(){
  const [corr, setCorr] = useState(null)
  const [diag, setDiag] = useState(null)
  const [target, setTarget] = useState('')
  const [predictors, setPredictors] = useState('')
  const [loading, setLoading] = useState(false)

  const runCorr = async () => {
    setLoading(true)
    try{
      const form = new FormData(); form.append('session_key', 'default')
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/correlogram`, { method: 'POST', body: form })
      const data = await res.json();
      setCorr(imgFromHex(data.image))
    } finally { setLoading(false) }
  }

  const runDiag = async () => {
    setLoading(true)
    try{
      const form = new FormData(); form.append('session_key','default'); form.append('target', target); form.append('predictors', predictors)
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/diagnostic-plots`, { method: 'POST', body: form })
      const data = await res.json();
      setDiag({
        resid_vs_fitted: imgFromHex(data.plots.resid_vs_fitted),
        qqplot: imgFromHex(data.plots.qqplot),
        cooks_leverage: imgFromHex(data.plots.cooks_leverage),
      })
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-4 space-y-4">
      <h3 className="text-white font-semibold">Visualizações</h3>
      <div className="flex flex-wrap gap-2 items-end">
        <button onClick={runCorr} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-md">Correlograma</button>
        <div className="flex flex-col">
          <label className="text-blue-200 text-sm">Target</label>
          <input value={target} onChange={e=>setTarget(e.target.value)} className="bg-slate-900 border border-blue-500/20 rounded-md p-2 text-blue-100" placeholder="nome da variável" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-blue-200 text-sm">Preditores (vírgula)</label>
          <input value={predictors} onChange={e=>setPredictors(e.target.value)} className="w-full bg-slate-900 border border-blue-500/20 rounded-md p-2 text-blue-100" placeholder="x1,x2,x3" />
        </div>
        <button onClick={runDiag} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-md">Plots de diagnóstico</button>
        {loading && <div className="text-blue-300 text-sm">Gerando...</div>}
      </div>

      {corr && (
        <div>
          <div className="text-blue-100 mb-2">Correlograma</div>
          <img alt="correlograma" src={corr} className="rounded-md border border-blue-500/20" />
        </div>
      )}

      {diag && (
        <div className="grid md:grid-cols-3 gap-3">
          <img alt="Resíduos vs Ajustado" src={diag.resid_vs_fitted} className="rounded-md border border-blue-500/20" />
          <img alt="QQ-plot" src={diag.qqplot} className="rounded-md border border-blue-500/20" />
          <img alt="Cook vs Leverage" src={diag.cooks_leverage} className="rounded-md border border-blue-500/20" />
        </div>
      )}
    </div>
  )
}
