const fs = require('fs');
const catalogData = JSON.parse(fs.readFileSync('src/data/catalog.json', 'utf8'));
const validProducts = catalogData.filter(p => p.Marca && p['Modelo / Silueta'] && p['Precio Venta Sugerido (S/)'] != null);
let sql = 'INSERT INTO public.products (marca, modelo, talla_eur, talla_us, precio, estado, colorway, imagen_url) VALUES \n';
const values = validProducts.map(p => {
  const marca = p.Marca.replace(/'/g, "''");
  const modelo = p['Modelo / Silueta'].replace(/'/g, "''");
  const tallaEur = p['Talla (EUR)'] || 0;
  const tallaUs = p['Talla (US)'] || 0;
  const precio = p['Precio Venta Sugerido (S/)'];
  const estado = (p['Estado / Condición'] || 'Nuevo').replace(/'/g, "''");
  const colorway = (p['Referencia Visual / Colorway'] || '').replace(/'/g, "''");
  return `('${marca}', '${modelo}', ${tallaEur}, ${tallaUs}, ${precio}, '${estado}', '${colorway}', '')`;
});
sql += values.join(',\n') + ';';
fs.writeFileSync('insert_products.sql', sql);
console.log('Done');
