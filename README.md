# Can Jev Understand a Trip?

**Live demo: [ride-hailing-jev-demo.vercel.app](https://ride-hailing-jev-demo.vercel.app)**

This is an exploratory ride-hailing interface for asking TypeSafe Jev to classify a hypothetical trip in Madrid, Spain. It is not a booking product, navigation service, fare quote, or model of real passenger behavior.

Pick an origin, destination, and local time, then evaluate the scenario. The demo turns verified local context into a concise natural-language description for Jev: date and time, straight-line separation, named mapped places near or containing each endpoint, and selected area-level census figures. It then asks Jev for a likely trip purpose and two continuous estimates: willingness to pay and willingness to wait.

The page shows both the exact context sent for the last evaluation and the typed response returned by Jev. Randomize samples two independent points inside official Madrid municipal boundaries, a Madrid-local time within the next seven calendar days, and performs one evaluation.

## What is and is not sent

The provider receives a plain-language trip scenario and the selected purpose categories. Raw coordinates, passenger identity, profile, trip history, choice history, routes, bookings, and payment data are not sent. The application instructs Jev not to invent personal characteristics, homes, jobs, appointments, or schedules.

The available evidence is intentionally limited. A nearby school, station, or attraction describes a location; it does not establish why an individual is travelling. Predictions are exploratory and their probabilities are not calibrated for real passengers.

## Example evaluation

This is an illustrative scenario produced for a weekday morning trip. It is the kind of plain-language context sent to Jev:

> It takes place on Tuesday, 22 September 2026 at 7:45 AM in Madrid, Spain. The origin and destination are 2.65 km apart in a straight line; this is not a road route or travel-time estimate. Origin is in Trafalgar, Chamberí. Census snapshot: mean age 44.4 years; mean net household income €51,693 per year. No named relevant place is mapped within 100 m. Destination is in Ciudad Universitaria, Moncloa - Aravaca. Census snapshot: mean age 44.9 years; mean net household income €71,512 per year. The selected point is inside Ciudad Universitaria. Named places within 100 m include Facultad de Filología y Filosofía.

Jev returns typed probabilities and scores. Results vary between evaluations; this is the response shape shown by the demo:

```json
{
  "model": "jev-1.13.0",
  "answers": {
    "demo_purpose": {
      "type": "choice",
      "choice": "commuting",
      "probabilities": {
        "commuting": 0.76,
        "business": 0.08,
        "leisure": 0.06,
        "tourism": 0.01,
        "other": 0.07,
        "transport_connection": 0.02
      },
      "confidence": 0.69
    },
    "demo_willingness_to_pay": {
      "type": "score",
      "score": 0.6,
      "legend": {"0": "Low", "1": "High"},
      "probabilities": {"0": 0.4, "1": 0.6},
      "confidence": 0.3
    }
  }
}
```

## Run locally

Requires Node.js 22.

```sh
npm install
cp .env.example .env.local
# Set TYPESAFE_API_KEY in .env.local
npm run dev
```

Then open `http://127.0.0.1:4173`.

```sh
npm test
npm run build
```

`TYPESAFE_API_KEY` is server-only. Keep `.env.local`, Vercel tokens, and deployment credentials out of Git.

## Project layout

- `src/` — browser interface and map interaction
- `api/` — Vercel evaluation endpoint
- `lib/` — validation, contextualization, scenario text, and response normalization
- `public/data/geography.json` — compact runtime snapshot used for the local geographic lookup
- `tests/` — Node test suite

## Data and attribution

The published runtime snapshot includes OpenStreetMap-derived place data and Madrid municipal geographic and aggregate-statistical context. © OpenStreetMap contributors, available under the [Open Database License](https://www.openstreetmap.org/copyright). Madrid boundary and statistical source material comes from the [Madrid City Council open-data and geoportal services](https://datos.madrid.es/) and the INE sources identified by those datasets. The snapshot is local and does not imply that any source endorses this demo or its predictions.

This repository does not grant a license to the included data. Check the original sources and their licenses before reusing it.
