"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

type Product = {
  id: number;
  marca: string;
  modelo: string;
  talla_eur: number;
  talla_us: number;
  precio: number;
  estado: string;
  colorway: string;
  imagen_url: string;
  galeria?: string[];
  stock: number;
  categoria: string;
};

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("TODOS");
  const [activeSizeFilter, setActiveSizeFilter] = useState<string>("TODAS");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (productsData) {
        setProducts(productsData);
        setFilteredProducts(productsData);
      }

      const { data: settingsData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'whatsapp_number')
        .single();
      
      if (settingsData) {
        setWhatsappNumber(settingsData.value);
      }
      
      setLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    let result = products;

    if (activeCategoryFilter !== "TODOS") {
      if (activeCategoryFilter === "OTROS/ACCESORIOS") {
        result = result.filter(p => p.categoria !== 'Zapatillas' && p.categoria !== 'Tableros');
      } else {
        result = result.filter(p => p.categoria === activeCategoryFilter);
      }
    }

    if (activeSizeFilter !== "TODAS") {
      result = result.filter(p => p.talla_eur?.toString() === activeSizeFilter);
    }

    setFilteredProducts(result);
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination on filter change
  }, [activeCategoryFilter, activeSizeFilter, products]);


  const handleBuy = (product: Product) => {
    if (!whatsappNumber) {
      alert("El sistema de compras está en mantenimiento. Intenta más tarde.");
      return;
    }
    const sizeText = product.categoria === 'Zapatillas' ? `(Talla ${product.talla_eur} Perú / ${product.talla_us} US)` : '';
    const message = `¡Hola! Vengo de la página GiveYourPeak. Me interesa comprar *${product.modelo}* ${sizeText} por S/ ${product.precio}. ¿Aún tienen stock?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  const uniqueSizes = Array.from(new Set(products.map(p => p.talla_eur).filter(t => t != null && t > 0))).sort((a, b) => a - b);
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <main className="min-h-screen bg-dark-bg text-white font-sans selection:bg-electric-blue selection:text-white pb-20 overflow-x-hidden">
      <nav className="w-full flex justify-between items-center px-8 py-6 border-b border-white/10 sticky top-0 bg-dark-bg/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Give Your Peak Logo" width={40} height={40} className="rounded-md" />
          <span className="text-xl font-oswald font-black tracking-wider text-white italic">GIVEYOUR<span className="text-electric-blue">PEAK</span></span>
        </div>
        <ul className="hidden md:flex gap-8 text-sm font-bold tracking-widest text-peak-silver">
          <li className="hover:text-electric-blue transition-colors cursor-pointer text-white">INICIO</li>
          <li className="hover:text-electric-blue transition-colors cursor-pointer"><a href="#catalogo">CATÁLOGO</a></li>
          <li className="hover:text-electric-blue transition-colors cursor-pointer"><a href="/nosotros">NOSOTROS</a></li>
        </ul>
      </nav>

      <section className="relative w-full px-8 py-24 md:py-32 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-blue/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex-1 max-w-2xl"
        >
          <h2 className="text-electric-blue font-mono font-bold tracking-widest mb-4 flex items-center gap-2">
            <span className="w-8 h-1 bg-electric-blue inline-block"></span>
            CATÁLOGO OFICIAL // 2026
          </h2>
          <h1 className="text-5xl md:text-7xl font-oswald font-black uppercase tracking-tighter leading-[0.9] mb-6">
            ALCANZA TU <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-blue-400">MÁXIMO POTENCIAL</span>
          </h1>
          <p className="text-peak-silver text-lg mb-10 max-w-lg leading-relaxed">
            Calzado deportivo de alto rendimiento y modelos exclusivos. Encuentra tu talla ideal y domina el juego con el mejor equipamiento.
          </p>
          <div className="flex gap-4">
            <a href="#catalogo" className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,102,255,0.4)] inline-block">
              VER CATÁLOGO →
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="z-10 flex-1 flex justify-center items-center relative"
        >
          <Image src="/logo.jpg" alt="Give Your Peak Hero" width={450} height={450} className="rounded-2xl shadow-[0_0_50px_rgba(0,102,255,0.2)] object-cover" priority />
        </motion.div>
      </section>

      <section id="catalogo" className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 gap-6">
          <div>
            <h3 className="text-electric-blue font-mono font-bold tracking-widest mb-2">[ 01 ] THE CATALOG</h3>
            <h2 className="text-4xl font-oswald font-black uppercase">Nuestra Tienda</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 w-full xl:w-auto">
            <div className="flex flex-wrap gap-2 bg-card-bg p-2 rounded-lg border border-white/10">
              {['TODOS', 'Zapatillas', 'Tableros', 'Básquetbol', 'OTROS/ACCESORIOS'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-4 py-2 text-sm font-bold rounded transition-colors ${
                    activeCategoryFilter === cat 
                    ? 'bg-electric-blue text-white' 
                    : 'text-peak-silver hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 bg-card-bg p-2 rounded-lg border border-white/10 px-4">
              <span className="text-sm font-bold text-peak-silver">TALLA (PERÚ):</span>
              <select 
                value={activeSizeFilter} 
                onChange={(e) => setActiveSizeFilter(e.target.value)}
                className="bg-dark-bg border border-white/20 text-white text-sm rounded focus:border-electric-blue outline-none p-1 font-mono"
              >
                <option value="TODAS">TODAS</option>
                {uniqueSizes.map(size => (
                  <option key={size} value={size.toString()}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-peak-silver font-mono">Cargando catálogo...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-peak-silver font-mono">No se encontraron productos con estos filtros.</div>
        ) : (
          <>
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
            >
              {visibleProducts.map((product) => {
                const agotado = product.stock !== undefined && product.stock <= 0;
                const secondImage = product.galeria && product.galeria.length > 0 ? product.galeria[0] : null;
                
                return (
                  <motion.div 
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    key={product.id} 
                    className={`bg-card-bg border border-white/10 rounded-xl overflow-hidden group hover:border-electric-blue/50 transition-all duration-300 relative ${agotado ? 'opacity-60 grayscale' : ''}`}
                  >
                    {agotado && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-red-600 text-white font-black px-6 py-2 rotate-[-15deg] uppercase tracking-widest border-2 border-dark-bg shadow-2xl">
                        AGOTADO
                      </div>
                    )}

                    <div className="aspect-square bg-[#0f0f13] relative p-8 flex items-center justify-center overflow-hidden">
                      <div className="absolute top-4 left-4 bg-dark-bg/80 px-2 py-1 text-xs font-mono text-electric-blue rounded border border-electric-blue/30 backdrop-blur-sm z-10">
                        {product.marca.split(' ')[0]}
                      </div>
                      
                      {product.imagen_url ? (
                        <div className="relative w-full h-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={product.imagen_url} 
                            alt={product.modelo} 
                            className={`w-full h-full object-cover transition-all duration-500 ${secondImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} 
                          />
                          {secondImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={secondImage} 
                              alt={`${product.modelo} vista 2`} 
                              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" 
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-lg flex flex-col items-center justify-center border border-white/5 relative opacity-50">
                          {product.categoria === 'Zapatillas' ? (
                            <svg className="w-16 h-16 text-white/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          ) : (
                            <span className="text-4xl text-white/20 mb-2">⚽</span>
                          )}
                          <span className="text-xs font-mono font-bold tracking-widest text-white/30">SIN IMAGEN</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg leading-tight w-2/3">{product.modelo}</h4>
                        <span className="text-electric-blue font-black text-xl font-oswald">S/ {product.precio}</span>
                      </div>
                      
                      <p className="text-peak-silver text-sm mb-4 truncate" title={product.colorway}>{product.colorway}</p>
                      
                      <div className="mb-6 h-12">
                        {product.categoria === 'Zapatillas' && product.talla_eur > 0 ? (
                          <>
                            <p className="text-xs text-peak-silver font-mono mb-2">TALLAS EQUIVALENTES</p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <span className="border border-white/20 bg-white/5 w-8 h-8 flex items-center justify-center text-xs font-bold rounded text-white">
                                  {product.talla_eur}
                                </span>
                                <span className="text-peak-silver text-[10px] font-mono">PERÚ/EUR</span>
                              </div>
                              <span className="text-white/20">|</span>
                              <div className="flex items-center gap-1">
                                <span className="border border-electric-blue text-electric-blue bg-electric-blue/10 w-8 h-8 flex items-center justify-center text-xs font-bold rounded">
                                  {product.talla_us}
                                </span>
                                <span className="text-peak-silver text-[10px] font-mono">US</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-peak-silver font-mono mb-2">CATEGORÍA</p>
                            <div className="inline-block border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold rounded text-white">
                              {product.categoria || 'Accesorio'}
                            </div>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-peak-silver mb-4 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full inline-block ${agotado ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        {agotado ? 'Sin stock' : product.estado}
                      </p>

                      <button 
                        onClick={() => handleBuy(product)}
                        disabled={agotado}
                        className="w-full bg-white/5 hover:bg-electric-blue disabled:hover:bg-white/5 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/10 hover:border-electric-blue disabled:hover:border-white/10 font-oswald tracking-wide"
                      >
                        {agotado ? 'NO DISPONIBLE' : 'COMPRAR AHORA'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {hasMore && (
              <div className="flex justify-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                  className="bg-transparent border-2 border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white px-10 py-4 rounded-full font-bold transition-all font-oswald tracking-widest"
                >
                  CARGAR MÁS PRODUCTOS ⬇️
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <footer className="border-t border-white/10 mt-20 px-8 py-12 flex flex-col md:flex-row justify-between items-center text-peak-silver text-sm font-mono gap-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Logo" width={30} height={30} className="rounded-sm opacity-50" />
          <span>© 2026 GIVEYOURPEAK. Todos los derechos reservados.</span>
        </div>
      </footer>
    </main>
  );
}
