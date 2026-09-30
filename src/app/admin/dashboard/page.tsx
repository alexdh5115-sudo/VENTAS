"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('TODOS');
  
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, product: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(product.id);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${product.id}-${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);

    if (uploadError) {
      alert("Error al subir imagen: " + uploadError.message);
      setUploadingId(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);

    // Si no tiene imagen principal, establecerla. Además, agregarla a la galería.
    const newGaleria = [...(product.galeria || []), publicUrl];
    const updates: any = { galeria: newGaleria };
    if (!product.imagen_url) {
      updates.imagen_url = publicUrl;
    }

    const { error: updateError } = await supabase.from('products').update(updates).eq('id', product.id);

    if (!updateError) {
      setProducts(products.map(p => p.id === product.id ? { ...p, ...updates } : p));
    }

    setUploadingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMarkSold = async (product: any) => {
    if (product.stock <= 0) return alert("El stock ya es 0.");
    if (!confirm(`¿Registrar la venta de 1x ${product.modelo}?`)) return;

    const newStock = product.stock - 1;
    const ganancia = product.precio - (product.costo_proveedor || 0);

    // 1. Reducir Stock
    await supabase.from('products').update({ stock: newStock }).eq('id', product.id);
    
    // 2. Registrar Venta
    await supabase.from('ventas').insert([{
      producto_id: product.id,
      marca: product.marca,
      modelo: product.modelo,
      precio_venta: product.precio,
      costo: product.costo_proveedor || 0,
      ganancia: ganancia
    }]);

    setProducts(products.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
    alert("¡Venta registrada exitosamente!");
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

  const uniqueCategories = Array.from(new Set(products.map(p => p.categoria || 'Accesorio'))).sort();
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.marca + ' ' + p.modelo).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'TODOS' || (p.categoria || 'Accesorio') === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Métricas
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalInversion = products.reduce((acc, p) => acc + ((p.costo_proveedor || 0) * (p.stock || 0)), 0);
  const totalGanancia = products.reduce((acc, p) => acc + ((p.precio - (p.costo_proveedor || 0)) * (p.stock || 0)), 0);

  return (
    <div className="min-h-screen bg-dark-bg text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-black uppercase">Panel de Control</h1>
            <p className="text-electric-blue font-mono text-sm">GIVEYOURPEAK ADMIN</p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/ventas" className="bg-white/5 border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
              📊 VER VENTAS
            </Link>
            <button onClick={handleLogout} className="border border-white/20 text-peak-silver hover:text-white px-4 py-2 rounded text-sm font-bold">
              CERRAR SESIÓN
            </button>
          </div>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card-bg border border-white/10 p-6 rounded-xl">
            <h3 className="text-peak-silver font-mono text-xs mb-2">INVENTARIO TOTAL</h3>
            <p className="text-4xl font-black">{totalStock} <span className="text-lg font-normal text-peak-silver">items</span></p>
          </div>
          <div className="bg-card-bg border border-white/10 p-6 rounded-xl">
            <h3 className="text-peak-silver font-mono text-xs mb-2">INVERSIÓN EN STOCK</h3>
            <p className="text-4xl font-black text-white">S/ {totalInversion.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-card-bg border border-electric-blue/30 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue/10 blur-2xl rounded-full"></div>
            <h3 className="text-electric-blue font-mono text-xs mb-2">GANANCIA POTENCIAL</h3>
            <p className="text-4xl font-black text-electric-blue">S/ {totalGanancia.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        <section className="bg-card-bg border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold whitespace-nowrap">Catálogo ({filteredProducts.length})</h2>
            <div className="flex gap-4 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Buscar modelo o marca..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 md:w-64 bg-[#0a0a0c] border border-white/20 rounded p-2 text-white text-sm focus:border-electric-blue outline-none"
              />
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[#0a0a0c] border border-white/20 rounded p-2 text-white text-sm focus:border-electric-blue outline-none"
              >
                <option value="TODOS">Todas las Categorías</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-[#0f0f13] z-10 shadow-md">
                <tr className="text-peak-silver text-xs font-mono border-b border-white/10">
                  <th className="p-4">IMÁGENES</th>
                  <th className="p-4">MODELO</th>
                  <th className="p-4">CATEGORÍA/TALLA</th>
                  <th className="p-4">FINANZAS</th>
                  <th className="p-4">STOCK</th>
                  <th className="p-4">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex gap-2 items-center">
                        {p.galeria && p.galeria.map((img: string, i: number) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={img} alt="Gal" className="w-12 h-12 bg-[#0a0a0c] rounded border border-white/10 object-cover" />
                        ))}
                        {(!p.galeria || p.galeria.length < 4) && (
                          <label className={`w-12 h-12 border border-dashed border-white/30 rounded flex items-center justify-center cursor-pointer hover:border-electric-blue hover:text-electric-blue text-peak-silver transition-colors ${uploadingId === p.id ? 'opacity-50' : ''}`}>
                            <span className="text-lg">+</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, p)} 
                              disabled={uploadingId !== null}
                            />
                          </label>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-sm">
                      {p.marca} <br/><span className="text-peak-silver font-normal">{p.modelo}</span>
                    </td>
                    <td className="p-4 text-sm">
                      {p.categoria === 'Zapatillas' && p.talla_eur > 0 ? (
                        <>{p.talla_eur} EUR <br/><span className="text-peak-silver">{p.talla_us} US</span></>
                      ) : (
                        <span className="text-peak-silver border border-white/10 px-2 py-1 rounded bg-white/5">{p.categoria || 'Accesorio'}</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      PVP: <span className="text-electric-blue font-bold">S/ {p.precio}</span><br/>
                      Gan: <span className="text-green-400 font-bold">+S/ {(p.precio - (p.costo_proveedor || 0)).toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        min="0"
                        value={p.stock ?? 1} 
                        onChange={(e) => handleUpdateStock(p.id, parseInt(e.target.value))}
                        className="w-16 bg-[#0a0a0c] border border-white/20 rounded p-1 text-white text-center focus:border-electric-blue outline-none"
                      />
                    </td>
                    <td className="p-4 flex gap-3 mt-2">
                      <button 
                        onClick={() => handleMarkSold(p)} 
                        disabled={p.stock <= 0}
                        className="bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600 hover:text-white px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-30"
                      >
                        ✅ VENDER
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400 text-xs font-bold underline">Eliminar</button>
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
