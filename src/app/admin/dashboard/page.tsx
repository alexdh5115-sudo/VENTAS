"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import catalogData from '@/data/catalog.json';

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin');
      return;
    }

    // Fetch config
    const { data: settings } = await supabase.from('settings').select('*').eq('key', 'whatsapp_number').single();
    if (settings) setWhatsapp(settings.value);

    // Fetch products
    const { data: prods } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (prods) setProducts(prods);

    setLoading(false);
  };

  const handleUpdateWhatsapp = async () => {
    const { error } = await supabase.from('settings').upsert({ key: 'whatsapp_number', value: whatsapp });
    if (error) alert("Error al actualizar: " + error.message);
    else alert("Número de WhatsApp actualizado correctamente.");
  };

  const handleLoadExcel = async () => {
    if (!confirm("¿Estás seguro de cargar los productos iniciales del Excel? Solo haz esto una vez para evitar duplicados.")) return;
    
    setLoading(true);
    
    // Filtrar filas vacías o sin precio válido
    const validProducts = catalogData.filter((p: any) => 
      p.Marca && p["Modelo / Silueta"] && p["Precio Venta Sugerido (S/)"] != null
    );

    const formattedProducts = validProducts.map((p: any) => ({
      marca: p.Marca,
      modelo: p["Modelo / Silueta"],
      talla_eur: p["Talla (EUR)"] || 0,
      talla_us: p["Talla (US)"] || 0,
      precio: p["Precio Venta Sugerido (S/)"] || 0,
      estado: p["Estado / Condición"] || 'Nuevo',
      colorway: p["Referencia Visual / Colorway"] || '',
      imagen_url: ""
    }));

    const { error } = await supabase.from('products').insert(formattedProducts);
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert(`¡${formattedProducts.length} productos cargados exitosamente!`);
      await checkAuthAndFetchData();
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  if (loading) return <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center font-mono">Cargando...</div>;

  return (
    <div className="min-h-screen bg-dark-bg text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-black uppercase">Panel de Control</h1>
            <p className="text-electric-blue font-mono text-sm">GIVEYOURPEAK ADMIN</p>
          </div>
          <button onClick={handleLogout} className="border border-white/20 text-peak-silver hover:text-white px-4 py-2 rounded text-sm font-bold">
            CERRAR SESIÓN
          </button>
        </div>

        {/* Configuración */}
        <section className="bg-card-bg border border-white/10 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>⚙️</span> Configuración de Ventas
          </h2>
          <div className="flex items-end gap-4 max-w-md">
            <div className="flex-1">
              <label className="block text-peak-silver text-xs font-mono mb-1">NÚMERO DE WHATSAPP (Ej: 51999999999)</label>
              <input 
                type="text" 
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-white/20 rounded p-2 text-white focus:border-electric-blue outline-none"
              />
            </div>
            <button onClick={handleUpdateWhatsapp} className="bg-electric-blue hover:bg-blue-600 px-4 py-2 rounded font-bold">
              Guardar
            </button>
          </div>
        </section>

        {/* Catálogo */}
        <section className="bg-card-bg border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold">Catálogo de Productos ({products.length})</h2>
            <div className="flex gap-4">
              {products.length === 0 && (
                <button onClick={handleLoadExcel} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded font-bold text-sm">
                  ⚡ CARGAR CATÁLOGO DEL EXCEL
                </button>
              )}
              <button className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded font-bold text-sm">
                + NUEVO PRODUCTO
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <div className="p-8 text-center text-peak-silver font-mono">
                No hay productos. Haz clic en &quot;Cargar Catálogo del Excel&quot; para subir los iniciales.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-peak-silver text-xs font-mono">
                    <th className="p-4">MARCA</th>
                    <th className="p-4">MODELO</th>
                    <th className="p-4">TALLA (US)</th>
                    <th className="p-4">PRECIO (S/)</th>
                    <th className="p-4">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 font-bold">{p.marca}</td>
                      <td className="p-4">{p.modelo}</td>
                      <td className="p-4">{p.talla_us}</td>
                      <td className="p-4 text-electric-blue font-bold">S/ {p.precio}</td>
                      <td className="p-4">
                        <button className="text-peak-silver hover:text-white underline text-sm mr-4">Editar</button>
                        <button className="text-red-500 hover:text-red-400 underline text-sm">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
