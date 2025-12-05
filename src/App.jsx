import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Calculator, RefreshCw, Github, Instagram, History, Trash2 } from 'lucide-react';
//teste VS CODE
const MalhasSystem = () => {
  const [numMalhas, setNumMalhas] = useState(3);
  const [matrixR, setMatrixR] = useState([]);
  const [vectorV, setVectorV] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Estado do histórico com persistência (localStorage)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('gideon_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar no localStorage sempre que o histórico mudar
  useEffect(() => {
    localStorage.setItem('gideon_history', JSON.stringify(history));
  }, [history]);

  // Inicializa as matrizes
  useEffect(() => {
    if (matrixR.length !== numMalhas) {
        const newMatrix = Array(numMalhas).fill(0).map(() => Array(numMalhas).fill(''));
        const newVector = Array(numMalhas).fill('');
        setMatrixR(newMatrix);
        setVectorV(newVector);
        setResults(null);
        setError('');
    }
  }, [numMalhas]);

  const handleMatrixChange = (row, col, value) => {
    const newMatrix = [...matrixR];
    newMatrix[row][col] = value;
    if (row !== col && newMatrix[col][row] === '') {
       newMatrix[col][row] = value;
    }
    setMatrixR(newMatrix);
  };

  const handleVectorChange = (index, value) => {
    const newVector = [...vectorV];
    newVector[index] = value;
    setVectorV(newVector);
  };

  const solveSystem = () => {
    setError('');
    setResults(null);

    let n = numMalhas;
    let A = matrixR.map(row => row.map(val => parseFloat(val)));
    let b = vectorV.map(val => parseFloat(val));

    for(let i=0; i<n; i++) {
        if(isNaN(b[i])) { setError("Preencha todas as tensões."); return; }
        for(let j=0; j<n; j++) {
            if(isNaN(A[i][j])) { setError("Preencha todas as resistências."); return; }
        }
    }

    // Algoritmo de Eliminação de Gauss
    for (let i = 0; i < n; i++) {
      let maxEl = Math.abs(A[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > maxEl) {
          maxEl = Math.abs(A[k][i]);
          maxRow = k;
        }
      }

      for (let k = i; k < n; k++) {
        let tmp = A[maxRow][k];
        A[maxRow][k] = A[i][k];
        A[i][k] = tmp;
      }
      let tmp = b[maxRow];
      b[maxRow] = b[i];
      b[i] = tmp;

      if (Math.abs(A[i][i]) < 1e-10) {
        setError("Sistema singular. Verifique as resistências.");
        return;
      }

      for (let k = i + 1; k < n; k++) {
        let c = -A[k][i] / A[i][i];
        for (let j = i; j < n; j++) {
          if (i === j) A[k][j] = 0;
          else A[k][j] += c * A[i][j];
        }
        b[k] += c * b[i];
      }
    }

    let x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += A[i][j] * x[j];
      }
      x[i] = (b[i] - sum) / A[i][i];
    }

    setResults(x);

    // Salvar no Histórico
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      malhas: n,
      resistencias: matrixR.map(row => [...row]), // Cópia segura
      tensoes: [...vectorV], // Cópia segura
      correntes: x
    };

    setHistory(prev => {
      const newHistory = [newEntry, ...prev];
      return newHistory.slice(0, 5); // Mantém apenas os 5 últimos
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-cyan-100 p-4 font-sans selection:bg-cyan-500 selection:text-white flex flex-col justify-center">
      <div className="w-full max-w-7xl mx-auto space-y-6">        
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-cyan-700/50 pb-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950 rounded-full border border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider text-white">GIDEON </h1>
              <p className="text-xs text-cyan-400 uppercase tracking-widest">Sistema de Calculo de Malhas</p>
                    <h2 className="text-xs text-cyan-400 uppercase tracking-widest">Trabalho Circuitos Elétricos 1</h2>

            </div>
          </div>
          <div className="flex items-center text-xs text-cyan-600 bg-slate-800/50 px-4 py-2 rounded-full border border-cyan-900/30">
            <Activity size={14} className="mr-1 text-green-400" /> Login
          </div>
        </header>

        {/* Controls */}
        <div className="bg-slate-800/50 p-6 rounded-lg border border-cyan-900/50 shadow-lg backdrop-blur-sm">
            <label className="block text-sm text-cyan-400 mb-2 font-semibold">Número de Malhas (N)</label>
            <div className="flex items-center space-x-4">
              <input 
                type="range" 
                min="2" 
                max="6" 
                value={numMalhas} 
                onChange={(e) => setNumMalhas(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-2xl font-mono text-white w-8 text-center">{numMalhas}</span>
            </div>
        </div>

        {/* Matrix Area */}
        <div className="bg-slate-800 p-6 rounded-xl border border-cyan-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-8 overflow-x-auto pb-4">
            
            <div className="flex flex-col items-center w-full md:w-auto">
              <span className="text-cyan-500 font-mono mb-2 text-lg">[ R ] (Resistências)</span>
              <div 
                className="grid gap-2 p-3 bg-slate-900/80 rounded border border-slate-700 w-full md:w-auto"
                style={{ gridTemplateColumns: `repeat(${numMalhas}, minmax(0, 1fr))` }}
              >
                {matrixR.map((row, i) => (
                  row.map((val, j) => (
                    <input
                      key={`${i}-${j}`}
                      type="number"
                      placeholder={i===j ? `R${i+1}${i+1}` : `R${i+1}${j+1}`}
                      value={val}
                      onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                      className={`w-full min-w-[3rem] h-12 text-center bg-slate-800 rounded border ${i===j ? 'border-cyan-600 text-cyan-200 font-bold' : 'border-slate-600 text-slate-300'} focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all placeholder:text-slate-600 text-sm md:text-base`}
                    />
                  ))
                ))}
              </div>
            </div>

            <div className="text-2xl text-slate-500 font-mono hidden md:block">×</div>

            <div className="flex flex-col items-center opacity-70 hidden md:flex">
              <span className="text-cyan-500 font-mono mb-2 text-lg">[ I ]</span>
              <div className="flex flex-col gap-2 p-3 bg-slate-900/50 rounded border border-slate-700/50">
                {Array(numMalhas).fill(0).map((_, i) => (
                  <div key={i} className="w-12 h-12 flex items-center justify-center text-slate-400 font-mono text-sm italic border border-dashed border-slate-700 rounded">
                    i<sub>{i+1}</sub>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-2xl text-slate-500 font-mono hidden md:block">=</div>

            <div className="flex flex-col items-center">
              <span className="text-yellow-500 font-mono mb-2 text-lg">[ V ] (Tensões)</span>
              <div className="flex flex-col gap-2 p-3 bg-slate-900/80 rounded border border-slate-700">
                {vectorV.map((val, i) => (
                  <input
                    key={i}
                    type="number"
                    placeholder={`V${i+1}`}
                    value={val}
                    onChange={(e) => handleVectorChange(i, e.target.value)}
                    className="w-16 h-12 text-center bg-slate-800 rounded border border-yellow-600/50 text-yellow-100 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all placeholder:text-slate-600 text-sm"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button 
              onClick={solveSystem}
              className="flex items-center px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <Calculator className="mr-2" size={20} />
              CALCULAR
            </button>
            <button 
              onClick={() => {
                const newMatrix = Array(numMalhas).fill(0).map(() => Array(numMalhas).fill(''));
                setMatrixR(newMatrix);
                setVectorV(Array(numMalhas).fill(''));
                setResults(null);
                setError('');
              }}
              className="flex items-center px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded transition-colors"
            >
              <RefreshCw className="mr-2" size={18} />
              Limpar
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded text-center animate-pulse">
              ⚠️ {error}
            </div>
          )}
        </div>

        {results && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-cyan-500/30 shadow-2xl animation-fade-in-up">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-2 flex items-center justify-between">
                <span className="flex items-center"><Activity className="mr-2 text-green-400" /> RESULTADOS</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((current, index) => (
                  <div key={index} className="bg-slate-950 p-4 rounded border-l-4 border-cyan-500 flex justify-between items-center group hover:bg-slate-900 transition-colors">
                    <div className="font-mono text-slate-400">
                      Corrente <span className="text-white font-bold">I<sub>{index + 1}</sub></span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono font-bold text-cyan-300">
                        {current.toFixed(4)} <span className="text-sm text-cyan-600">A</span>
                      </div>
                      {Math.abs(current) < 1 && Math.abs(current) > 0 && (
                        <div className="text-xs text-slate-500">
                          {(current * 1000).toFixed(2)} mA
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* --- SEÇÃO DE HISTÓRICO --- */}
        {history.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-400 flex items-center">
                <History className="mr-2 text-cyan-600" /> HISTÓRICO RECENTE (Últimos 5)
              </h3>
              <button 
                onClick={() => setHistory([])}
                className="text-xs text-red-400 hover:text-red-300 flex items-center bg-red-950/30 px-3 py-1 rounded border border-red-900/50"
              >
                <Trash2 size={12} className="mr-1" /> Limpar Histórico
              </button>
            </div>

            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-700/50">
                    <span className="text-cyan-500 text-sm font-mono font-bold">
                      {item.malhas} Malhas
                    </span>
                    <span className="text-slate-500 text-xs font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                  
                  {/* Resumo dos Resultados do Item */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300">
                    {item.correntes.map((curr, idx) => (
                      <div key={idx} className="bg-slate-900 px-2 py-1 rounded flex justify-between">
                        <span className="text-slate-500">I<sub>{idx + 1}</sub></span>
                        <span className="text-cyan-200">{curr.toFixed(3)}A</span>
                      </div>
                    ))}
                  </div>

                  {/* Detalhes ao passar o mouse */}
                  <div className="mt-2 text-[10px] text-slate-500 truncate">
                    V: [{item.tensoes.join(', ')}] | R: {JSON.stringify(item.resistencias)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RODAPÉ OFICIAL */}
        <footer className="mt-12 py-8 border-t border-cyan-900/30 text-center relative z-10">
          <div className="mb-4">
            <p className="text-slate-400 text-sm">
              Arquitetado e Desenvolvido por <span className="text-cyan-400 font-bold tracking-wide">JOÃO HEITOR, MAURICIO MATIAS, GUSTAVO SOARES</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">Sistema de Análise de Malhas v1.0</p>
          </div>

          <div className="flex justify-center space-x-6">
            <a 
              href="https://github.com/joaoheitor01" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-slate-500 hover:text-white transition-colors duration-300"
            >
              <Github size={20} className="mr-2" />
              <span className="text-sm">GitHub</span>
            </a>

            <a 
              href="https://www.instagram.com/joaoheitorbertoloto/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-slate-500 hover:text-pink-500 transition-colors duration-300"
            >
              <Instagram size={20} className="mr-2" />
              <span className="text-sm">Instagram</span>
            </a>
          </div>
          
          <div className="mt-8 text-[10px] text-slate-700 font-mono">
            GIDEON OS • SECURE CONNECTION • {new Date().getFullYear()}
          </div>
        </footer>

      </div>
    </div>
  );
};

export default MalhasSystem;