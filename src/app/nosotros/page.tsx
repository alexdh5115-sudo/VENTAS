import Image from 'next/image';
import Link from 'next/link';

export default function Nosotros() {
  return (
    <main className="min-h-screen bg-dark-bg text-white font-sans selection:bg-electric-blue selection:text-white pb-20">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-6 border-b border-white/10 sticky top-0 bg-dark-bg/80 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Give Your Peak Logo" width={40} height={40} className="rounded-md" />
          <span className="text-xl font-black tracking-wider text-white italic">GIVEYOUR<span className="text-electric-blue">PEAK</span></span>
        </Link>
        <ul className="hidden md:flex gap-8 text-sm font-bold tracking-widest text-peak-silver">
          <li className="hover:text-electric-blue transition-colors cursor-pointer"><Link href="/">INICIO</Link></li>
          <li className="hover:text-electric-blue transition-colors cursor-pointer"><Link href="/#catalogo">CATÁLOGO</Link></li>
          <li className="text-white">NOSOTROS</li>
        </ul>
      </nav>

      {/* Header */}
      <header className="relative py-24 text-center px-8 border-b border-white/10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-blue/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
            ELEVANDO EL JUEGO <br/> EN <span className="text-electric-blue">PERÚ</span>
          </h1>
          <p className="text-peak-silver text-lg leading-relaxed">
            No solo vendemos zapatillas. Entregamos las herramientas para que domines en la cancha, con las mejores marcas, exclusividad y la garantía que mereces.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-8 py-20 flex flex-col md:flex-row gap-16 items-center">
        <div className="flex-1">
          <h2 className="text-3xl font-black uppercase mb-6 border-l-4 border-electric-blue pl-4">¿Por qué elegirnos?</h2>
          <div className="space-y-8 text-peak-silver">
            <p>
              En <strong className="text-white">Give Your Peak</strong>, entendemos que cada jugador es diferente. Ya sea que necesites la tracción perfecta para un crossover rápido, o la amortiguación ideal para proteger tus rodillas tras un salto, tenemos el par exacto para ti.
            </p>
            <p>
              Nuestro catálogo incluye desde modelos accesibles para quienes recién empiezan, hasta ediciones <strong>Premium y Protro</strong> que usan las estrellas más grandes del baloncesto mundial como LeBron James, Kevin Durant y Kyrie Irving.
            </p>
            <ul className="list-disc pl-5 space-y-3 mt-4 text-white">
              <li><span className="text-electric-blue font-bold">Variedad Total:</span> Calzado, tableros, balones oficiales y más.</li>
              <li><span className="text-electric-blue font-bold">Tallas Peruanas:</span> Filtrado pensado en nuestro mercado local.</li>
              <li><span className="text-electric-blue font-bold">Atención Personalizada:</span> Ventas directas y asesoramiento por WhatsApp.</li>
            </ul>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <div className="aspect-square bg-white/5 rounded-2xl border border-white/10 p-4 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Image 
              src="/logo.jpg" 
              alt="Misión" 
              width={500} 
              height={500} 
              className="w-full h-full object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 text-center bg-electric-blue/10 border-y border-electric-blue/20">
        <h2 className="text-3xl font-black uppercase mb-4">¿Listo para dar tu máximo?</h2>
        <p className="text-peak-silver mb-8">Revisa nuestro inventario actual y asegura tu par antes de que se agote.</p>
        <Link href="/#catalogo" className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,102,255,0.4)] inline-block">
          IR AL CATÁLOGO →
        </Link>
      </section>
    </main>
  );
}
