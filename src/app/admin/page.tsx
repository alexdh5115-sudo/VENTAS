"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="bg-card-bg border border-white/10 p-8 rounded-xl max-w-md w-full shadow-2xl">
        <div className="flex justify-center mb-6">
          <Image src="/logo.jpg" alt="Logo" width={60} height={60} className="rounded-lg" />
        </div>
        <h1 className="text-2xl font-black text-center text-white mb-2 uppercase">Give Your Peak</h1>
        <h2 className="text-electric-blue font-mono text-center text-sm mb-8 tracking-widest">PANEL DE CONTROL</h2>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded text-sm mb-6">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-peak-silver text-xs font-mono mb-1">CORREO ELECTRÓNICO</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/20 rounded p-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-peak-silver text-xs font-mono mb-1">CONTRASEÑA</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/20 rounded p-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-electric-blue hover:bg-blue-600 text-white font-bold py-3 rounded mt-4 transition-colors disabled:opacity-50"
          >
            {loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>
      </div>
    </div>
  );
}
