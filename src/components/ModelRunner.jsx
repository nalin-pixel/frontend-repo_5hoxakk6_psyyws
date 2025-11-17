import { useEffect, useMemo, useState } from 'react'

export default function ModelRunner({ summary }){
  const [target, setTarget] = useState('')
  const [predictors, setPredictors] = useState([])
  const [standardize, setStandardize] = useState(false)
  const [imputation, setImputation] = useState('median')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if (!summary) return
    setTarget('')
    setPredictors([])
  },[summary])

  const numericCols = useMemo(()=> Object.entries(summary?.dtypes||{}).filter(([k,v])=> v.includes('float')||v.includes('int')).map(([k])=>k), [summary])
  const allCols = summary?.columns||[]

  const togglePredictor = (col) => {
    setPredictors(prev => prev.includes(col) ? prev.filter(c=>c!==col) : [...prev, col])
  }

  const run = async () => {
    setLoading(true)
    setResult(null)
    try{
      const body = {
        session_key: 'default',
        target,
        predictors,
        standardize,
        imputation,
        dummy_encode: true,
        transforms: {},
        models: ['ols','ridge','lasso','elasticnet','rf','gbr','xgb'],
        selection_metric: 'rmse',
        cv_folds: 5
      }
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error||'Erro ao modelar')
      setResult(data)
    }catch(e){
      setResult({ error: e.message })
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-4 space-y-4">
      <h3 className="text-white font-semibold">Modelagem</h3>
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="text-blue-200 text-sm">Variável resposta</label>
          <select value={target} onChange={e=>setTarget(e.target.value)} className="w-full mt-1 bg-slate-900 border border-blue-500/20 rounded-md p-2 text-blue-100">
            <option value="">Selecione</option>
            {numericCols.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-blue-200 text-sm">Preditores</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {allCols.filter(c=>c!==target).map(c => (
              <button type="button" key={c} onClick={()=>togglePredictor(c)} className={`px-3 py-1 rounded-full border ${predictors.includes(c)?'bg-blue-600 text-white border-blue-500':'bg-slate-900 text-blue-100 border-blue-500/30'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-blue-200 text-sm">
          <input type="checkbox" checked={standardize} onChange={(e)=>setStandardize(e.target.checked)} />
          Padronizar numéricas
        </label>
        <label className="text-blue-200 text-sm">
          Imputação
          <select value={imputation} onChange={e=>setImputation(e.target.value)} className="ml-2 bg-slate-900 border border-blue-500/20 rounded-md p-1 text-blue-100">
            <option value="mean">Média</option>
            <option value="median">Mediana</option>
            <option value="most_frequent">Moda</option>
          </select>
        </label>
        <button disabled={!target || predictors.length===0 || loading} onClick={run} className="ml-auto bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-md">{loading? 'Rodando...' : 'Rodar Pipeline'}</button>
      </div>

      {result && !result.error && (
        <div className="space-y-3">
          <div className="text-blue-100">{result.explanation}</div>
          <div className="grid md:grid-cols-3 gap-3">
            {result.results.map(r => (
              <div key={r.name} className="bg-slate-900/60 border border-blue-500/20 rounded-lg p-3 text-blue-100 text-sm">
                <div className="font-semibold text-white mb-1 uppercase">{r.name}</div>
                <div>RMSE: {r.rmse.toFixed(4)}</div>
                <div>MAE: {r.mae.toFixed(4)}</div>
                <div>R²: {r.r2.toFixed(4)} | R² aj.: {isNaN(r.adj_r2)? '-' : r.adj_r2.toFixed(4)}</div>
                {r.cv_metric!==null && <div>CV ({5} folds) {`(sel)`}: {r.cv_metric.toFixed(4)}</div>}
              </div>
            ))}
          </div>

          {result.diagnostics && (
            <div className="bg-slate-900/60 border border-blue-500/20 rounded-lg p-3 text-blue-100 text-sm">
              <div className="font-semibold text-white mb-2">Diagnósticos (OLS)</div>
              <div className="grid md:grid-cols-2 gap-2">
                <div>Shapiro-Wilk p: {result.diagnostics.shapiro?.p?.toFixed ? result.diagnostics.shapiro.p.toFixed(4) : '-'}</div>
                <div>Anderson-Darling p: {result.diagnostics.anderson_darling?.p?.toFixed ? result.diagnostics.anderson_darling.p.toFixed(4) : '-'}</div>
                <div>Breusch-Pagan p: {result.diagnostics.breusch_pagan?.f_p?.toFixed ? result.diagnostics.breusch_pagan.f_p.toFixed(4) : '-'}</div>
                <div>White p: {result.diagnostics.white?.p?.toFixed ? result.diagnostics.white.p.toFixed(4) : '-'}</div>
                <div>Durbin-Watson: {result.diagnostics.durbin_watson ? result.diagnostics.durbin_watson.toFixed(4) : '-'}</div>
              </div>
            </div>
          )}
        </div>
      )}
      {result && result.error && <div className="text-red-400 text-sm">{result.error}</div>}
    </div>
  )
}
