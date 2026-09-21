import test from 'node:test';
import assert from 'node:assert/strict';
import {prepare} from '../lib/jev.mjs';

test('provider state is an explanatory trip scenario with no raw coordinates', () => {
  const request = prepare({
    trips: [{current_trip: {
      request_local_datetime: '2026-09-22T01:15',
      origin: {coordinates: [40.4355, -3.7035]},
      destination: {coordinates: [40.4489, -3.7294]}
    }}],
    categories: [
      {id: 'commuting', label: 'Commuting', description: 'Travel for work or study.'},
      {id: 'leisure', label: 'Leisure', description: 'Recreation.'}
    ]
  });

  assert.deepEqual(Object.keys(request.state), ['trip_scenario']);
  assert.match(request.state.trip_scenario, /Tuesday, 22 September 2026 at 1:15 AM in Madrid, Spain/);
  assert.doesNotMatch(request.state.trip_scenario, /night hours/);
  assert.match(request.state.trip_scenario, /Origin is/);
  assert.match(request.state.trip_scenario, /Destination is/);
  assert.match(request.state.trip_scenario, /Census snapshot: mean age 44\.4 years; mean net household income €51,693 per year/);
  assert.doesNotMatch(request.state.trip_scenario, /household size/);
  assert.doesNotMatch(request.state.trip_scenario, /anonymous ride-hailing trip|a weekday|a weekend|Neighborhood names identify location only/);
  assert.doesNotMatch(JSON.stringify(request.state), /40\.4355|-3\.7035|coordinates/);
  assert.match(request.questions.demo_purpose.instructions, /`trip_scenario`/);
});
