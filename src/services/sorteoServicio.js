// src/servicios/sorteoServicio.js
const crypto = require('crypto');
const db = require('../configuracion/db');
const Sorteo = require('../modelos/sorteoModelo');
const Juego = require('../modelos/juegoModelo');
const { Op } = require('sequelize');

/** Cierra todos los sorteos "abiertos" cuyo Cierre ya pasó */
async function cerrarSorteosVencidos() {
  const ahora = new Date();
  const [afectados] = await Sorteo.update(
    { Estado: 'cerrado' },
    { where: { Estado: 'abierto', Cierre: { [Op.lte]: ahora } } }
  );
  if (afectados > 0) {
    console.log(`[scheduler] Cerrados ${afectados} sorteo(s) a las ${ahora.toISOString()}`);
  }
  return afectados;
}

/** Genera números únicos aleatorios en [min, max] (incluye 00 y 99 si están en rango) */
function generarUnicos(cuantos, min, max) {
  const total = max - min + 1;
  if (cuantos > total) throw new Error('No se pueden generar más números únicos que el rango disponible');
  const set = new Set();
  while (set.size < cuantos) {
    const n = crypto.randomInt(min, max + 1);
    set.add(n);
  }
  return Array.from(set).sort((a, b) => a - b);
}

/** Sortea todos los sorteos "cerrados" que aún no tienen NumerosGanadores */
async function sortearSorteosCerrados() {
  const pendientes = await Sorteo.findAll({
    where: { Estado: 'cerrado', NumerosGanadores: null },
  });

  for (const s of pendientes) {
    await db.transaction(async (t) => {
      // Releer con LOCK para evitar doble ejecución en concurrencia
      const sorteo = await Sorteo.findOne({
        where: { Id: s.Id },
        lock: t.LOCK.UPDATE,
        transaction: t
      });
      if (!sorteo || sorteo.Estado !== 'cerrado' || sorteo.NumerosGanadores) return;

      const juego = await Juego.findByPk(sorteo.IdJuego, { transaction: t });
      if (!juego) throw new Error(`Juego ${sorteo.IdJuego} no encontrado`);

      // Reglas: si no hay repetidos y es K-de-N, ganadores = CantidadNumeros - 1
      // (Para tus juegos actuales: Pega 3 => 3, Superpremio => 5)
      const cantidadGanadores = Math.max(1, Number(juego.CantidadNumeros) - 1);
      const numeros = generarUnicos(cantidadGanadores, Number(juego.RangoMin), Number(juego.RangoMax));

      await sorteo.update(
        { NumerosGanadores: numeros, Estado: 'sorteado' },
        { transaction: t }
      );

      console.log(`[scheduler] Sorteado sorteo ${sorteo.Id} (juego ${juego.Nombre}) -> ganadores: ${numeros.join(', ')}`);
    });
  }

  return pendientes.length;
}

module.exports = {
  cerrarSorteosVencidos,
  sortearSorteosCerrados,
};
