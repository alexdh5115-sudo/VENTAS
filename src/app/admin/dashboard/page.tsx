"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import catalogData from '@/data/catalog.json';

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    const { data: settings } = await supabase.from('settings').select('*').eq('key', 'whatsapp_number').single();
    if (settings) setWhatsapp(settings.value);

    const { data: prods } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (prods) setProducts(prods);

    setLoading(false);
  };

  const handleUpdateWhatsapp = async () => {
    const { error } = await supabase.from('settings').upsert({ key: 'whatsapp_number', value: whatsapp });
    if (error) alert("Error: " + error.message);
    else alert("Número de WhatsApp actualizado.");
  };

  const handleUpdateStock = async (id: number, newStock: number) => {
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id);
    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(productId);
    
    // Generar nombre de archivo único
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    // Subir a Storage
    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);

    if (uploadError) {
      alert("Error al subir imagen: " + uploadError.message);
      setUploadingId(null);
      return;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);

    // Guardar URL en la tabla de productos
    const { error: updateError } = await supabase.from('products').update({ imagen_url: publicUrl }).eq('id', productId);

    if (!updateError) {
      setProducts(products.map(p => p.id === productId ? { ...p, imagen_url: publicUrl } : p));
    }

    setUploadingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: number) => {
    if(!confirm("¿Eliminar este producto?")) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p => p.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  if (loading) return <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center font-mono">Cargando panel...</div>;

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

        <section className="bg-card-bg border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold">Catálogo de Productos ({products.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-peak-silver text-xs font-mono">
                  <th className="p-4">IMAGEN</th>
                  <th className="p-4">MODELO</th>
                  <th className="p-4">TALLA</th>
                  <th className="p-4">PRECIO</th>
                  <th className="p-4">STOCK</th>
                  <th className="p-4">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="w-16 h-16 bg-[#0a0a0c] rounded border border-white/10 overflow-hidden relative flex items-center justify-center">
                        {p.imagen_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imagen_url} alt="Prod" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-peak-silver">SIN FOTO</span>
                        )}
                        <label className={`absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity ${uploadingId === p.id ? 'opacity-100' : ''}`}>
                          {uploadingId === p.id ? <span className="text-xs">⏳</span> : <span className="text-xs font-bold">+ FOTO</span>}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, p.id)} 
                            disabled={uploadingId !== null}
                          />
                        </label>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-sm">
                      {p.marca} <br/><span className="text-peak-silver font-normal">{p.modelo}</span>
                    </td>
                    <td className="p-4 text-sm">
                      {p.talla_eur} EUR <br/><span className="text-peak-silver">{p.talla_us} US</span>
                    </td>
                    <td className="p-4 text-electric-blue font-bold">S/ {p.precio}</td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        min="0"
                        value={p.stock ?? 1} 
                        onChange={(e) => handleUpdateStock(p.id, parseInt(e.target.value))}
                        className="w-16 bg-[#0a0a0c] border border-white/20 rounded p-1 text-white text-center focus:border-electric-blue outline-none"
                      />
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400 text-sm font-bold">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
