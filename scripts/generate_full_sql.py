import pandas as pd
import math

file = 'C:/Users/fadep/Downloads/Catalogo Maestro Zapatillas e Implementos (Definitivo - Precios Internos en Blanco).xlsx'
xl = pd.ExcelFile(file)

sql = "INSERT INTO public.products (marca, modelo, talla_eur, talla_us, precio, estado, colorway, imagen_url, costo_proveedor, categoria) VALUES \n"
values = []

# Hoja 1: Zapatillas
df_zap = xl.parse(0)
for index, row in df_zap.iterrows():
    marca = str(row.get('Marca', '')).replace("'", "''")
    modelo = str(row.get('Modelo / Silueta', '')).replace("'", "''")
    precio = row.get('Precio Venta Sugerido (S/)')
    
    if pd.isna(precio) or type(precio) == str or not marca or marca == 'nan':
        continue
        
    talla_eur = row.get('Talla (EUR)', 0)
    if pd.isna(talla_eur): talla_eur = 0
    
    talla_us = row.get('Talla (US)', 0)
    if pd.isna(talla_us): talla_us = 0
    
    costo = row.get('Costo Proveedor PCC (S/)', 0)
    if pd.isna(costo): costo = 0
    
    estado = str(row.get('Estado / Condición', 'Nuevo')).replace("'", "''")
    colorway = str(row.get('Referencia Visual / Colorway', '')).replace("'", "''")
    
    values.append(f"('{marca}', '{modelo}', {talla_eur}, {talla_us}, {precio}, '{estado}', '{colorway}', '', {costo}, 'Zapatillas')")

# Hojas siguientes (Fútbol, Básquetbol)
for sheet_idx in [1, 2]:
    df_other = xl.parse(sheet_idx)
    for index, row in df_other.iterrows():
        marca = str(row.get('Marca', '')).replace("'", "''")
        modelo = str(row.get('Modelo / Descripción', '')).replace("'", "''")
        precio = row.get('Tu Precio Sugerido PVP (S/)')
        
        if pd.isna(precio) or type(precio) == str or not marca or marca == 'nan':
            continue
            
        costo = row.get('Costo Proveedor PCC (S/)', 0)
        if pd.isna(costo): costo = 0
        
        categoria = str(row.get('Deporte / Área') or row.get('Subcategoría') or 'Accesorios').replace("'", "''")
        if categoria == 'nan': categoria = 'Accesorios'
        
        values.append(f"('{marca}', '{modelo}', NULL, NULL, {precio}, 'Nuevo', '', '', {costo}, '{categoria}')")

sql += ",\n".join(values) + ";"

with open("insert_all_products.sql", "w", encoding="utf-8") as f:
    f.write(sql)
print("Generado exitosamente con", len(values), "productos.")
