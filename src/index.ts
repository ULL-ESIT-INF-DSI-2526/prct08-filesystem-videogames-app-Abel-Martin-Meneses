import fs from 'fs';
import path from 'path';
import { searchContent, replaceContent, saveReport } from './fileManager.js';

const TEST_DIR = './directorio_prueba';
const TEST_FILE = path.join(TEST_DIR, 'documento.txt');

if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

fs.writeFileSync(TEST_FILE, 'Hola Hola mundo\nAdiós mundo\nHola de nuevo mundo', 'utf-8');

console.log("\n--- INICIANDO BÚSQUEDA ---");
try {
  const { matches, report } = searchContent(TEST_DIR, 'Hola');
  
  console.log("-> Resumen del análisis:");
  console.log(report);
  
  console.log("-> Coincidencias encontradas:");
  console.log(JSON.stringify(matches, null, 2));

  console.log("\n--- GUARDANDO INFORME JSON ---");
  saveReport('informe_prueba.json', report);
  console.log("¡Informe guardado con éxito en 'informe_prueba.json'!");

} catch (error: any) {
  console.error("Error en la búsqueda:", error.message);
}

console.log("\n--- INICIANDO REEMPLAZO ---");
try {
  const resultado = replaceContent(TEST_FILE, 'Hola', 'Adiós');
  console.log(resultado);
  
  const nuevoContenido = fs.readFileSync(TEST_FILE, 'utf-8');
  console.log("\n-> Nuevo contenido del archivo:");
  console.log(nuevoContenido);

} catch (error: any) {
  console.error("Error en el reemplazo:", error.message);
}

console.log("\n--- PRUEBA FINALIZADA ---");