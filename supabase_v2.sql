-- 1. Añadir columna de stock a la tabla de productos (por defecto 1 par)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 1;

-- 2. Crear el Bucket (Carpeta) para las imágenes de los productos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;

-- 3. Configurar Permisos (RLS) para Storage (Imágenes)
-- Permitir que CUALQUIERA (público) pueda ver las imágenes
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Permitir que solo usuarios autenticados (Tú como Admin) puedan subir imágenes
CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
