"use client";

export default function PvPError({ error }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black/80 to-emerald-900/20 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-500/20 rounded-3xl p-8 border-4 border-red-500/50 mx-auto mb-8 flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-4">Lobby Error</h1>
        <p className="text-xl text-gray-300 mb-8">{error || 'Something went wrong'}</p>
        <button 
          onClick={() => window.location.href = '/pvp'}
          className="px-8 py-4 bg-emerald-500/80 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all"
        >
          ← Back to PvP
        </button>
      </div>
    </div>
  );
}

