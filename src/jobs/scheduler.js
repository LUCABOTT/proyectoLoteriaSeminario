// src/jobs/scheduler.js
const { cerrarSorteosVencidos, sortearSorteosCerrados } = require('../servicios/sorteoServicio');

let timers = [];

function startScheduler() {
  const enabled = (process.env.SCHEDULER_ENABLED || 'true').toLowerCase() === 'true';
  const intervalMs = Number(process.env.SCHEDULER_INTERVAL_MS || 60000);

  if (!enabled) {
    console.log('[scheduler] Deshabilitado por SCHEDULER_ENABLED=false');
    return;
  }

  console.log(`[scheduler] Iniciando… intervalo=${intervalMs}ms`);

  // Job A: cierre automático (cada intervalo)
  timers.push(setInterval(async () => {
    try {
      await cerrarSorteosVencidos();
    } catch (err) {
      console.error('[scheduler] Error al cerrar sorteos vencidos:', err.message);
    }
  }, intervalMs));

  // Job B: sorteo automático (cada intervalo)
  timers.push(setInterval(async () => {
    try {
      await sortearSorteosCerrados();
    } catch (err) {
      console.error('[scheduler] Error al sortear sorteos cerrados:', err.message);
    }
  }, intervalMs));
}

function stopScheduler() {
  for (const t of timers) clearInterval(t);
  timers = [];
  console.log('[scheduler] Detenido');
}

module.exports = { startScheduler, stopScheduler };
