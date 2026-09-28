"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("TODOS");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch Products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (productsData) {
        setProducts(productsData);
        setFilteredProducts(productsData);
      }

      // Fetch WhatsApp Number
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

  const handleFilter = (brand: string) => {
    setActiveFilter(brand);
    if (brand === "TODOS") {
      setFilteredProducts(products);
    } else if (brand === "OTROS") {
      setFilteredProducts(products.filter(p => p.marca.toLowerCase() !== 'nike' && p.marca.toLowerCase() !== 'jordan' && !p.marca.toLowerCase().includes('jordan / nike')));
    } else {
      setFilteredProducts(products.filter(p => p.marca.toLowerCase().includes(brand.toLowerCase())));
    }
  };

  const handleBuy = (product: Product) => {
    if (!whatsappNumber) {
      alert("El sistema de compras está en mantenimiento. Intenta más tarde.");
      return;
    }
    const message = `¡Hola! Vengo desde GiveYourPeak. Me interesa comprar las zapatillas *${product.modelo}* (Talla ${product.talla_us} US) por S/ ${product.precio}. ¿Aún tienen stock?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-dark-bg text-white font-sans selection:bg-electric-blue selection:text-white pb-20">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-6 border-b border-white/10 sticky top-0 bg-dark-bg/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Give Your Peak Logo" width={40} height={40} className="rounded-md" />
          <span className="text-xl font-black tracking-wider text-white italic">GIVEYOUR<span className="text-electric-blue">PEAK</span></span>
        </div>
        <ul className="hidden md:flex gap-8 text-sm font-bold tracking-widest text-peak-silver">
          <li className="hover:text-electric-blue transition-colors cursor-pointer text-white">INICIO</li>
          <li className="hover:text-electric-blue transition-colors cursor-pointer">CATÁLOGO</li>
          <li className="hover:text-electric-blue transition-colors cursor-pointer">NOSOTROS</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full px-8 py-24 md:py-32 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-blue/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="z-10 flex-1 max-w-2xl">
          <h2 className="text-electric-blue font-mono font-bold tracking-widest mb-4 flex items-center gap-2">
            <span className="w-8 h-1 bg-electric-blue inline-block"></span>
            CATÁLOGO OFICIAL // 2026
          </h2>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
            ALCANZA TU <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-blue-400">MÁXIMO POTENCIAL</span>
          </h1>
          <p className="text-peak-silver text-lg mb-10 max-w-lg leading-relaxed">
            Calzado deportivo de alto rendimiento y modelos exclusivos. Encuentra tu talla ideal y domina el juego con el mejor equipamiento.
          </p>
          <div className="flex gap-4">
            <a href="#catalogo" className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,102,255,0.4)]">
              VER CATÁLOGO →
            </a>
          </div>
        </div>

        <div className="z-10 flex-1 flex justify-center items-center relative">
          <Image src="/logo.jpg" alt="Give Your Peak Hero" width={500} height={500} className="rounded-xl shadow-2xl shadow-electric-blue/20 object-cover" priority />
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalogo" className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h3 className="text-electric-blue font-mono font-bold tracking-widest mb-2">[ 01 ] THE CATALOG</h3>
            <h2 className="text-4xl font-black uppercase">Nuestras Zapatillas</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            {['TODOS', 'NIKE', 'JORDAN', 'OTROS'].map(brand => (
              <button 
                key={brand}
                onClick={() => handleFilter(brand)}
                className={`px-4 py-1 text-sm font-bold rounded-sm transition-colors border ${
                  activeFilter === brand 
                  ? 'bg-electric-blue text-white border-electric-blue' 
                  : 'border-white/20 text-peak-silver hover:text-white'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-peak-silver font-mono">Cargando catálogo desde la base de datos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-peak-silver font-mono">No se encontraron productos en esta categoría.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-card-bg border border-white/10 rounded-xl overflow-hidden group hover:border-electric-blue/50 transition-all duration-300">
                <div className="aspect-square bg-[#0f0f13] relative p-8 flex items-center justify-center overflow-hidden">
                  <div className="absolute top-4 left-4 bg-dark-bg/80 px-2 py-1 text-xs font-mono text-electric-blue rounded border border-electric-blue/30 backdrop-blur-sm z-10">
                    {product.marca.split(' ')[0]}
                  </div>
                  {product.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imagen_url} alt={product.modelo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-lg flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform duration-500 relative">
                      <span className="text-white/20 font-mono text-sm absolute text-center px-4">SIN FOTO<br/>(Editar en Admin)</span>
                      <span className="text-6xl opacity-10">👟</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg leading-tight w-2/3">{product.modelo}</h4>
                    <span className="text-electric-blue font-black text-xl">S/ {product.precio}</span>
                  </div>
                  
                  <p className="text-peak-silver text-sm mb-4 truncate" title={product.colorway}>{product.colorway}</p>
                  
                  <div className="mb-6">
                    <p className="text-xs text-peak-silver font-mono mb-2">TALLAS DISPONIBLES</p>
                    <div className="flex gap-2">
                      <span className="border border-electric-blue text-electric-blue bg-electric-blue/10 w-8 h-8 flex items-center justify-center text-xs font-bold rounded">
                        {product.talla_us}
                      </span>
                      <span className="text-peak-silver text-xs flex items-center">US ({product.talla_eur} EUR)</span>
                    </div>
                  </div>

                  <p className="text-xs text-peak-silver mb-4 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                    {product.estado}
                  </p>

                  <button 
                    onClick={() => handleBuy(product)}
                    className="w-full bg-white/5 hover:bg-electric-blue text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/10 hover:border-electric-blue"
                  >
                    COMPRAR AHORA
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 px-8 py-12 flex flex-col md:flex-row justify-between items-center text-peak-silver text-sm font-mono gap-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Logo" width={30} height={30} className="rounded-sm opacity-50" />
          <span>© 2026 GIVEYOURPEAK. Todos los derechos reservados.</span>
        </div>
      </footer>
    </main>
  );
}
