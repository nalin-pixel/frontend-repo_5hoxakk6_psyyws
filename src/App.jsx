import { useState } from 'react'
import Uploader from './components/Uploader'
import Preview from './components/Preview'
import ModelRunner from './components/ModelRunner'
import Plots from './components/Plots'

function App() {
  const [data, setData] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      <div className="relative max-w-6xl mx-auto p-6 space-y-6">
        <header className="text-center py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Auto Análise de Regressão</h1>
          <p className="text-blue-200">Envie seu dataset, configure e gere modelos, testes e gráficos profissionais</p>
        </header>

        <section>
          <Uploader onUploaded={setData} />
        </section>

        {data && (
          <>
            <section>
              <Preview summary={data.summary} preview={data.preview} />
            </section>
            <section>
              <ModelRunner summary={data.summary} />
            </section>
            <section>
              <Plots />
            </section>
          </>
        )}

        {!data && (
          <div className="text-center text-blue-200/80">Envie um arquivo CSV/TSV/XLSX para iniciar.</div>
        )}

        <footer className="text-center py-6 text-blue-300/60 text-sm">Projeto de Inferência e Regressão • Geração automática de análises</footer>
      </div>
    </div>
  )
}

export default App