import test from 'node:test';
import assert from 'node:assert/strict';
import {prepare} from '../lib/jev.mjs';

test('sparse local evidence does not make Other the default modal purpose', () => {
  const request = prepare({
    trips: [{current_trip: {request_local_datetime: '2026-09-22T07:45', origin: {coordinates: [40.4355, -3.7035]}, destination: {coordinates: [40.4489, -3.7294]}}}],
    categories: [
      {id: 'commuting', label: 'Commuting', description: 'Travel for work or study.'},
      {id: 'business', label: 'Business', description: 'Professional activity.'},
      {id: 'leisure', label: 'Leisure', description: 'Recreation.'},
      {id: 'tourism', label: 'Tourism', description: 'Sightseeing.'},
      {id: 'other', label: 'Other', description: 'A purpose outside the named categories.'},
      {id: 'transport_connection', label: 'Transport connection', description: 'A connection to another journey.'}
    ]
  });
  assert.match(request.questions.demo_purpose.instructions, /Never make `other` the modal choice solely because local evidence is sparse/);
});
