const pad = value => String(value).padStart(2, '0');

function madridDateParts(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  return Object.fromEntries(parts.filter(({type}) => type !== 'literal').map(({type, value}) => [type, value]));
}

export function randomMadridLocalDateTime(now = new Date(), rng = Math.random) {
  const {year, month, day} = madridDateParts(now);
  const date = new Date(`${year}-${month}-${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + Math.floor(rng() * 7));

  const minuteOfDay = Math.floor(rng() * 24 * 60);
  return `${date.toISOString().slice(0, 10)}T${pad(Math.floor(minuteOfDay / 60))}:${pad(minuteOfDay % 60)}`;
}
