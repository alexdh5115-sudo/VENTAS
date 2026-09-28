-- 1. Modificar la tabla actual para incluir las nuevas columnas necesarias para el Admin y otras categorías
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS costo_proveedor NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Zapatillas';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 1;

-- 2. Hacer opcionales las tallas (ya que los balones y tableros no tienen talla de zapatos)
ALTER TABLE public.products ALTER COLUMN talla_eur DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN talla_us DROP NOT NULL;

-- 3. Crear el Bucket para guardar las fotos que subas desde el admin
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;

-- 4. Configurar Permisos para que la gente vea las fotos, pero solo el Admin pueda subirlas
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
