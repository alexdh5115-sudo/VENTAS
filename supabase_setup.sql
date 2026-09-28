-- Ejecuta todo este código en el SQL Editor de tu panel de Supabase

-- 1. Crear tabla de configuraciones (para el número de WhatsApp)
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
);

-- Insertar el número de WhatsApp por defecto (vacío por ahora)
INSERT INTO public.settings (key, value) VALUES ('whatsapp_number', '51999999999') ON CONFLICT (key) DO NOTHING;

-- 2. Crear tabla de productos
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    talla_eur NUMERIC NOT NULL,
    talla_us NUMERIC NOT NULL,
    precio NUMERIC NOT NULL,
    estado TEXT NOT NULL,
    colorway TEXT,
    imagen_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Configurar Permisos (RLS - Row Level Security)
-- Permitir lectura a todos (público)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública de productos" ON public.products FOR SELECT USING (true);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública de configuraciones" ON public.settings FOR SELECT USING (true);

-- Permitir escritura solo a usuarios autenticados (Administradores)
CREATE POLICY "Permitir gestión de productos a usuarios autenticados" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir gestión de configuraciones a usuarios autenticados" ON public.settings FOR ALL USING (auth.role() = 'authenticated');
