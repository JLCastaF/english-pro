import http from 'k6/http';
import { check, sleep } from 'k6';
// Importamos el generador oficial de reportes visuales HTML directamente desde k6
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// =========================================================================
// 1. CONFIGURACIÓN DE CARGA Y PICO DE USUARIOS (STAGES)
// =========================================================================
export const options = {
  stages: [
    { duration: '5s', target: 100 },  // Calentamiento: Sube suavemente a 100 usuarios simultáneos
    { duration: '10s', target: 500 }, // 🚀 AQUÍ SUBE AL PICO: Escala hasta 500 usuarios simultáneos
    { duration: '10s', target: 1000 }, // 🔥 AQUÍ MANTIENE EL PICO MÁXIMO: 1000 usuarios golpeando el servidor a la vez
    { duration: '5s', target: 100 },   // Enfriamiento: Baja a 100 usuarios para cerrar la prueba limpio
  ],
};

// =========================================================================
// 2. ACCIONES QUE EJECUTA CADA USUARIO VIRTUAL
// =========================================================================
export default function () {
  // ⚡ AQUÍ SE DISPARA EL PICO DE PETICIONES POR CADA USUARIO:
  // En lugar de pedir 1 archivo a la vez, http.batch dispara 3 peticiones SIMULTÁNEAS
  // (50 usuarios x 3 peticiones paralelas = 150 peticiones concurrentes por ciclo)
  const responses = http.batch([
    ['GET', 'http://127.0.0.1:5173/'],
    ['GET', 'http://127.0.0.1:5173/src/main.jsx'],
    ['GET', 'http://127.0.0.1:5173/src/App.jsx'],
  ]);

  // Verificamos que el servidor responda con éxito (HTTP 200)
  check(responses[0], {
    'estado 200': (r) => r.status === 200,
  });

  // Pausa realista de 0.5 segundos entre cada acción del usuario
  sleep(0.5);
}

// =========================================================================
// 3. GENERACIÓN AUTOMÁTICA DEL REPORTE VISUAL HTML
// =========================================================================
export function handleSummary(data) {
  return {
    // Crea el archivo visual listo para abrir en Chrome/Edge
    "reporte-qaupve.html": htmlReport(data),
    // Mantiene el resumen normal en tu consola negra
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}