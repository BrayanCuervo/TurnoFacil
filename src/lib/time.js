// Bogota esta en UTC-5 todo el ano (sin horario de verano)
const OFFSET_MS = 5 * 3600 * 1000;
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const bog = (ts) => new Date(new Date(ts).getTime() - OFFSET_MS);
const pad = (n) => String(n).padStart(2, '0');

export function isoDate(ts) {
  const d = bog(ts);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function formatDate(ts) {
  const d = bog(ts);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function formatDateLong(ts) {
  const d = bog(ts);
  return `${DAYS_LONG[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}

export function formatTime(ts) {
  const d = bog(ts);
  let h = d.getUTCHours();
  const ampm = h >= 12 ? 'p. m.' : 'a. m.';
  h = h % 12 || 12;
  return `${h}:${pad(d.getUTCMinutes())} ${ampm}`;
}

// Proximos dias habiles (lunes a sabado) empezando hoy
export function nextBusinessDays(count = 14) {
  const out = [];
  let t = Date.now();
  while (out.length < count) {
    const d = bog(t);
    if (d.getUTCDay() !== 0) {
      out.push({ iso: isoDate(t), day: DAYS[d.getUTCDay()], num: d.getUTCDate(), month: MONTHS[d.getUTCMonth()] });
    }
    t += 24 * 3600 * 1000;
  }
  return out;
}

export const hoursUntil = (ts) => (new Date(ts).getTime() - Date.now()) / 3600000;

export const formatPrice = (n) => '$' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
