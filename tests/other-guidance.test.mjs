import test from 'node:test';
import assert from 'node:assert/strict';
import {prepare} from '../lib/jev.mjs';

test('sparse local evidence does not make personal errands the default modal purpose', () => {
  const request = prepare({
    trips: [{current_trip: {request_local_datetime: '2026-09-22T07:45', origin: {coordinates: [40.4355, -3.7035]}, destination: {coordinates: [40.4489, -3.7294]}}}],
    categories: [
      {id: 'commuting', label: 'Commuting', description: 'Travel for work or study.'},
      {id: 'business', label: 'Business', description: 'Professional activity.'},
      {id: 'leisure', label: 'Leisure', description: 'Recreation.'},
      {id: 'visitor_activity', label: 'Visitor activity', description: 'Sightseeing or visiting.'},
      {id: 'personal_errand', label: 'Personal errand or appointment', description: 'A practical personal trip.'},
      {id: 'transport_connection', label: 'Airport or intercity transfer', description: 'A connection to another journey.'}
    ]
  });
  assert.match(request.questions.demo_purpose.instructions, /Never make the personal-errand category modal solely because local evidence is sparse/);
});
