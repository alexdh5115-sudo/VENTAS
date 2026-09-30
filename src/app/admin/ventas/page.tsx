"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Ventas() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchVentas();
  }, []);

  const checkAuthAndFetchVentas = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin');
      return;
    }

    const { data } = await supabase.from('ventas').select('*').order('fecha', { ascending: false });
    if (data) setVentas(data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center font-mono">Cargando ventas...</div>;

  const totalVentas = ventas.length;
  const ingresosTotales = ventas.reduce((sum, v) => sum + v.precio_venta, 0);
  const gananciaNetaTotal = ventas.reduce((sum, v) => sum + v.ganancia, 0);

  return (
    <div className="min-h-screen bg-dark-bg text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-black uppercase">Historial de Ventas</h1>
            <p className="text-electric-blue font-mono text-sm">REPORTE FINANCIERO</p>
          </div>
          <Link href="/admin/dashboard" className="border border-white/20 text-peak-silver hover:text-white px-4 py-2 rounded text-sm font-bold">
            ← VOLVER AL CATÁLOGO
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card-bg border border-white/10 p-6 rounded-xl">
            <h3 className="text-peak-silver font-mono text-xs mb-2">PRODUCTOS VENDIDOS</h3>
            <p className="text-4xl font-black">{totalVentas}</p>
          </div>
          <div className="bg-card-bg border border-white/10 p-6 rounded-xl">
            <h3 className="text-peak-silver font-mono text-xs mb-2">INGRESOS BRUTOS</h3>
            <p className="text-4xl font-black text-white">S/ {ingresosTotales.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-card-bg border border-green-500/30 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-2xl rounded-full"></div>
            <h3 className="text-green-400 font-mono text-xs mb-2">GANANCIA NETA REAL</h3>
            <p className="text-4xl font-black text-green-400">S/ {gananciaNetaTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        <section className="bg-card-bg border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-[#0f0f13] z-10 shadow-md">
                <tr className="text-peak-silver text-xs font-mono border-b border-white/10">
                  <th className="p-4">FECHA</th>
                  <th className="p-4">MARCA</th>
                  <th className="p-4">MODELO</th>
                  <th className="p-4">VENTA (S/)</th>
                  <th className="p-4">COSTO (S/)</th>
                  <th className="p-4 text-green-400">GANANCIA</th>
                </tr>
              </thead>
              <tbody>
                {ventas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-peak-silver">No hay ventas registradas aún.</td>
                  </tr>
                ) : (
                  ventas.map(v => (
                    <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-sm font-mono text-peak-silver">
                        {new Date(v.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-bold text-sm">{v.marca}</td>
                      <td className="p-4 text-sm text-peak-silver">{v.modelo}</td>
                      <td className="p-4 font-bold">S/ {v.precio_venta}</td>
                      <td className="p-4 text-sm font-mono text-peak-silver">S/ {v.costo}</td>
                      <td className="p-4 font-bold text-green-400">+S/ {v.ganancia}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
