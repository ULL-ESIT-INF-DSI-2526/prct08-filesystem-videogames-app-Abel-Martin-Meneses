import fs from 'fs';
import path from 'path';
import { SearchMatch, SearchReport } from './types.js';

/**
 * Función que busca recursivamente una palabra en los ficheros de un directorio y sus subdirectorios
 * @param dir - directorio en el que hay que empezar la búsqueda
 * @param searchTerm - palabra a buscar en los ficheros
 * @returns devuelve un objeto con un array de objetos SearchMatch, que contiene el fichero donde se encontró la palabra, la ruta absoluta y las líneas donde se encontró, 
 *          y un objeto SearchReport que contiene el total de ficheros analizados, los ficheros que tenían esa palabra 
 *          y el total de apariciones de la palabra en todos los ficheros.
 */
export const searchContent = (dir: string, searchTerm: string): { matches: SearchMatch[], report: SearchReport } => {
  const targetDir = path.resolve(dir);

  if (!fs.existsSync(targetDir)) {
    throw new Error(`El directorio no existe: ${targetDir}`);
  } 

  const report: SearchReport = { totalFilesAnalyzed: 0, filesWithMatches: 0, totalOccurrences: 0 };
  const matches: SearchMatch[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(targetDir, { recursive: true, withFileTypes: true });
  } catch {
    throw new Error(`No se tienen permisos para leer el directorio: ${targetDir}`);
  }

  // Obtenemos todos los ficheros del directorio y subdirectorios ignorando los .bak
  const validFiles = entries.filter(entry => entry.isFile() && path.extname(entry.name) !== '.bak');

  for (const file of validFiles) {
    const folderPath = file.parentPath; 
    const fullPath = path.join(folderPath, file.name);

    try {
      // Comprobamos que se puede leer
      fs.accessSync(fullPath, fs.constants.R_OK);
      
      const content = fs.readFileSync(fullPath, 'utf-8');
      report.totalFilesAnalyzed++;
      
      const lines = content.split('\n');
      const matchLines: number[] = [];

      lines.forEach((line, index) => {
        if (line.includes(searchTerm)) {
          matchLines.push(index + 1);
          const occurrencesInLine = line.split(searchTerm).length - 1;
          report.totalOccurrences += occurrencesInLine;
        }
      });

      if (matchLines.length > 0) {
        report.filesWithMatches++;
        matches.push({ 
          file: file.name, 
          absolutePath: fullPath, 
          lines: matchLines 
        });
      }
    } catch {
      continue; 
    }
  }

  return { matches, report };
};

/**
 * Función para reemplazar una palabra por otra en un fichero generando previamente una copia de seguridad
 * @param filePath - ruta del archivo a reemplazar
 * @param searchTerm - palabra a buscar
 * @param replaceTerm - nueva palabra
 * @returns devuelve una string diciendo que se ha reemplazado la palabra y que se ha generado una copia de seguridad
 */
export const replaceContent = (filePath: string, searchTerm: string, replaceTerm: string): string => {
  const targetPath = path.resolve(filePath);

  if (!fs.existsSync(targetPath)) {
    throw new Error(`El fichero no existe: ${targetPath}`);
  }

  try {
    fs.accessSync(targetPath, fs.constants.W_OK | fs.constants.R_OK);
  } catch {
    throw new Error(`No se tienen permisos de escritura/lectura en: ${targetPath}`);
  }

  const content = fs.readFileSync(targetPath, 'utf-8');
  
  if (!content.includes(searchTerm)) {
    throw new Error(`La cadena "${searchTerm}" no se encuentra en el fichero.`);
  }

  // Backup y reemplazo
  const bakPath = `${targetPath}.bak`;
  fs.copyFileSync(targetPath, bakPath);

  const newContent = content.split(searchTerm).join(replaceTerm);
  fs.writeFileSync(targetPath, newContent, 'utf-8');

  return `Contenido reemplazado con éxito. Copia guardada como: ${path.basename(bakPath)}`;
};

/**
 * Función que guarda un informe en una ruta determinada
 * @param reportPath - ruta donde se guardará el informe
 * @param report - objeto SearchReport
 */
export const saveReport = (reportPath: string, report: SearchReport): void => {
  fs.writeFileSync(path.resolve(reportPath), JSON.stringify(report, null, 2), 'utf-8');
};