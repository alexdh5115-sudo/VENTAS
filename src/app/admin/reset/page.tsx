"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario llegó con una sesión válida de recuperación
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("El enlace de recuperación es inválido o ha expirado.");
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("¡Contraseña actualizada exitosamente!");
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="bg-card-bg border border-white/10 p-8 rounded-xl max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-500/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="flex justify-center mb-6 relative z-10">
          <Image src="/logo.jpg" alt="Logo" width={60} height={60} className="rounded-lg shadow-lg" />
        </div>
        
        <h1 className="text-2xl font-black text-center text-white mb-2 uppercase tracking-tight">Give Your Peak</h1>
        <h2 className="text-green-400 font-mono text-center text-sm mb-8 tracking-widest">NUEVA CONTRASEÑA</h2>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-sm mb-6 text-center font-mono">{error}</div>}
        {message && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded text-sm mb-6 text-center font-mono">{message}</div>}

        <form onSubmit={handleUpdatePassword} className="space-y-4 relative z-10">
          <div>
            <label className="block text-peak-silver text-xs font-mono mb-1">INGRESA TU NUEVA CONTRASEÑA</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/10 rounded p-3 text-white focus:border-green-500 focus:outline-none transition-colors"
              required
              disabled={!!error && !message} // Deshabilitar si el enlace caducó
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || (!!error && !message)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded mt-4 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          >
            {loading ? 'ACTUALIZANDO...' : 'GUARDAR Y ENTRAR'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => router.push('/admin')}
            className="text-peak-silver hover:text-white text-xs font-mono underline"
          >
            VOLVER AL LOGIN
          </button>
        </div>
      </div>
    </div>
  );
}
