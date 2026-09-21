const dateText = datetime => new Date(`${datetime.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', {
  timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});
const timeText = datetime => {
  const [hour, minute] = datetime.slice(11).split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
};

function placeText(point, label) {
  const area = [point.geo_context?.neighborhood, point.geo_context?.district].filter(Boolean).join(', ');
  const places = (point.facility_context?.matches || []).filter(place => place.name).slice(0, 3);
  const inside = places.filter(place => place.relation === 'inside').map(place => place.name);
  const nearby = places.filter(place => place.relation !== 'inside').map(place => place.name);
  const metrics = point.area_statistics?.metrics;
  const census = metrics?.mean_age?.value != null && metrics?.net_income_household?.value != null
    ? `Census snapshot: mean age ${metrics.mean_age.value.toFixed(1)} years; mean net household income €${Math.round(metrics.net_income_household.value).toLocaleString('en')} per year.`
    : 'Census snapshot: no published local figures are available.';
  const parts = [`${label} is in ${area || 'an unclassified part of Madrid'}.`, census];
  if (inside.length) parts.push(`The selected point is inside ${inside.join(', ')}.`);
  if (nearby.length) parts.push(`Named places within 100 m include ${nearby.join(', ')}.`);
  if (!inside.length && !nearby.length) parts.push('No named relevant place is mapped within 100 m.');
  return parts.join(' ');
}

export function describeTrip(currentTrip, signals) {
  const time = timeText(currentTrip.request_local_datetime);
  const holiday = signals.calendar.destination.local.name || signals.calendar.destination.regional.name || signals.calendar.destination.national.name;
  return [
    `It takes place on ${dateText(currentTrip.request_local_datetime)} at ${time} in Madrid, Spain.${holiday ? ` It is ${holiday}.` : ''}`,
    `The origin and destination are ${signals.straight_line_distance.km} km apart in a straight line; this is not a road route or travel-time estimate.`,
    placeText(currentTrip.origin, 'Origin'),
    placeText(currentTrip.destination, 'Destination')
  ].join(' ');
}
