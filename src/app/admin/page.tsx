"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales incorrectas.");
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Te hemos enviado un enlace a tu correo para restablecer tu contraseña.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="bg-card-bg border border-white/10 p-8 rounded-xl max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-electric-blue/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="flex justify-center mb-6 relative z-10">
          <Image src="/logo.jpg" alt="Logo" width={60} height={60} className="rounded-lg shadow-lg" />
        </div>
        
        <h1 className="text-2xl font-black text-center text-white mb-2 uppercase tracking-tight">Give Your Peak</h1>
        <h2 className="text-electric-blue font-mono text-center text-sm mb-8 tracking-widest">
          {isRecovering ? 'RECUPERACIÓN' : 'PANEL DE CONTROL'}
        </h2>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-sm mb-6 text-center font-mono">{error}</div>}
        {message && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded text-sm mb-6 text-center font-mono">{message}</div>}

        <form onSubmit={isRecovering ? handleRecover : handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-peak-silver text-xs font-mono mb-1">CORREO ELECTRÓNICO</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/10 rounded p-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
              required
            />
          </div>
          
          {!isRecovering && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-peak-silver text-xs font-mono">CONTRASEÑA</label>
                <button 
                  type="button" 
                  onClick={() => { setIsRecovering(true); setError(''); setMessage(''); }} 
                  className="text-electric-blue text-xs font-bold hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-white/10 rounded p-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-electric-blue hover:bg-blue-600 text-white font-bold py-3 rounded mt-4 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(0,102,255,0.3)]"
          >
            {loading ? 'PROCESANDO...' : (isRecovering ? 'ENVIAR ENLACE' : 'INICIAR SESIÓN')}
          </button>
        </form>

        {isRecovering && (
          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => { setIsRecovering(false); setError(''); setMessage(''); }} 
              className="text-peak-silver hover:text-white text-xs font-mono underline"
            >
              VOLVER AL LOGIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
