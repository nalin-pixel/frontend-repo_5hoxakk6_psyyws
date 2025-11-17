export default function Preview({ summary, preview }) {
  if (!summary) return null
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Linhas" value={summary.n_rows} />
        <Stat label="Colunas" value={summary.n_cols} />
        <Stat label="Numéricas" value={Object.values(summary.dtypes).filter(d=>d.includes('float')||d.includes('int')).length} />
        <Stat label="Categóricas" value={Object.values(summary.dtypes).filter(d=>d.includes('object')||d.includes('category')).length} />
      </div>

      <div className="overflow-auto max-h-96 border border-blue-500/20 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800/60 sticky top-0">
            <tr>
              {summary.columns.map(c => (
                <th key={c} className="px-3 py-2 text-left text-blue-200 font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} className="odd:bg-slate-900/30">
                {summary.columns.map(c => (
                  <td key={c} className="px-3 py-1 text-blue-100 whitespace-nowrap">{String(row[c])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-800/60 border border-blue-500/20 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Missing por coluna</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {Object.entries(summary.missing_per_column).map(([k,v]) => (
            <div key={k} className="flex justify-between text-blue-100"><span>{k}</span><span>{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }){
  return (
    <div className="bg-slate-800/60 border border-blue-500/20 rounded-lg p-4">
      <div className="text-blue-300 text-xs uppercase">{label}</div>
      <div className="text-white text-xl font-bold">{value}</div>
    </div>
  )
}
