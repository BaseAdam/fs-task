# Full Stack Test Task - solution

An Express + MongoDB backend for the product listing, and the provided React frontend wired up to
it. The original task description is kept in [TASK.md](./TASK.md).

## Quick start

Two commands, in two terminals:

```bash
docker compose up      # or: npm run dev:be   → MongoDB, seed data and the API on :8080
npm run dev:fe         #                      → the frontend on :5173
```

`docker compose up` starts the database, loads the six products into it, and then starts the API.

Then open:

| | |
| --- | --- |
| http://localhost:5173 | the application |
| http://localhost:8080/api/docs | interactive API documentation (Swagger UI) |
| http://localhost:8080/api/health-check | `{"status":"ok","db":"connected"}` |

**Requirements:** Docker, and Node 22 for the frontend.
Port 8080 has to be free - MongoDB deliberately publishes no port at all, so a MongoDB already
running on your machine will not get in the way.

To start over with an empty database: `docker compose down -v`.

## Running the backend without Docker

If you already have MongoDB on `localhost:27017`:

```bash
npm install
cd be
npm run seed     # loads the six products
npm run dev      # API on :8080
```

Configuration is read from `be/.env`, and every value has a working default, so the file is
optional. `be/.env.example` lists what can be overridden:

| variable | default |
| --- | --- |
| `PORT` | `8080` |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/fs-test-task` |
| `CORS_ORIGIN` | `http://localhost:5173` |

## The API

### `GET /api/products`

Every parameter is optional.

| parameter | type | notes |
| --- | --- | --- |
| `search` | string | matches part of the product code, case-insensitive |
| `capacity` | number | exact match; fractional values such as `10.5` are valid |
| `energyClass` | `A`–`G` | exact match |
| `feature` | string | matches products whose feature list contains it |
| `sort` | `price` \| `capacity` | ascending |
| `page` | integer ≥ 1 | default `1` |
| `limit` | integer 1–100 | default `6` |

```jsonc
// GET /api/products?capacity=9&sort=price
{
  "products": [ /* … */ ],
  "meta": { "total": 2, "page": 1, "limit": 6, "totalPages": 1 }
}
```

`meta.total` counts everything matching the filters, ignoring paging - that is what lets the
frontend know whether "Pokaż więcej" has anything left to show.

### `GET /api/health-check`

`200` with `{"status":"ok","db":"connected"}` when the database is reachable, `503` with
`"degraded"` when it is not. The API stays up either way.

### Errors

Both error paths share one shape:

```jsonc
// 400 — GET /api/products?sort=name
{ "error": { "code": "BAD_REQUEST", "message": "Invalid query parameter 'sort': …" } }
```

`400` for a query parameter of the wrong type or outside its range, `404` for an unknown route,
`500` for anything unexpected. On the frontend a failed request shows a message and a retry
button; a failed "Pokaż więcej" leaves the products already on screen in place.

## Design decisions

### The product schema

**`dimensions` is an object, not a string.** The mock stored `'55 x 60 x 85 cm'`, which does not
say which number is which. The order was not guessed: the product card renders these under the
label `Wymiary(GxSxW)` - głębokość × szerokość × wysokość - so they are stored as `depth`,
`width`, `height` and a `unit`.

**`capacity` is a number and `features` is a plain array of strings**, deliberately not enums. A
new model with a different capacity or a new feature should not require a code change.
**`energyClass` is an enum `A`-`G`**, because that one really is a closed, regulated set.

**`code` is unique.** It is the natural business key, and the database - not the application -
enforces it.

### The seed can be run any number of times

It upserts on `code` with a single `bulkWrite` rather than inserting. `insertMany` would fail
with a duplicate-key error the second time, and deleting everything first would throw away
anything added since. This is what allows `docker compose up` to run the seed on every start.

A re-run reports `updated: 6` even when nothing changed, because mongoose refreshes `updatedAt`
on every write. `inserted: 0` is what shows there are no duplicates.

### Pagination is stable

Results are sorted by `_id` as the last key. Four products share the price `1999`, and a sort
that leaves ties undecided lets the database return them in any order - so paging through the
list could show the same product twice, or skip one entirely.

### Searching is literal

The search text is escaped before it becomes a regular expression. Without that, `.*` would
match every product instead of none, and an unbalanced bracket would break the query.

### The API documentation is generated from the validation

The query parameters at `/api/docs` come from `z.toJSONSchema()` applied to the same zod schema
that validates incoming requests. Types, enums, ranges and defaults cannot drift from the actual
behaviour, because they are the actual behaviour. The response shape is written by hand - the
backend validates what comes in, not what goes out, so there is nothing to generate it from.

## Tests

```bash
cd be
npm test                  # everything (needs Docker)
npm run test:unit         # no Docker, ~300 ms
npm run test:integration  # starts a MongoDB container
```

**20 unit tests** run against stand-ins, with no database. **12 integration tests** go through the
whole stack - route, controller, service, repository, MongoDB - using
[testcontainers](https://testcontainers.com/) with the same `mongo:8` image `docker compose` uses,
and [supertest](https://github.com/ladjs/supertest) to make real HTTP requests without binding a
port.

Expected results in the integration tests are worked out from the seed data rather than written
out as numbers, so adding a product does not send anyone editing test expectations. Every test
starts from a freshly reloaded collection, so no test depends on what another one did.

There are no end-to-end tests: the application renders a list and keeps the cart in React state,
so a browser-driven test would mostly be testing the test tooling.

## Changes to the provided frontend

Besides replacing the mock data:

- **TypeScript raised from `^4.9.4` to `^5.9.3`.** The backend uses zod 4, whose type definitions
  need TypeScript 5. npm workspaces hoist a single TypeScript to the repo root, so with 4.9 any
  editor opening this project reported hundreds of errors inside `node_modules/zod` even though
  the backend type-checked fine on its own. The frontend builds and lints clean on 5.9.
- `IProduct` follows the API: `dimensions` is an object, and `capacity` and `energyClass` are no
  longer fixed sets.
- The API layer converts the two dates from the strings JSON carries back into `Date` objects, in
  one place, so the rest of the app can keep treating them as dates.
- Searching is debounced, and a request that is no longer needed is cancelled, so a slow answer to
  an old query cannot overwrite a newer one.

## Deliberate limitations

- **The feature filter takes one value**, because that is what the dropdown offers. Supporting
  several would need `{ features: { $all: [...] } }` and a multi-select on the frontend; `$all`
  with a single value behaves exactly like the current match, so the change would be backwards
  compatible.
- **No caching.** On a real product I would put a caching data layer in front of the API - RTK Query,
  React Query or similar - so that going back to a filter already used serves the result it already has
  instead of fetching the same thing again.
- **The page size is 6 and the seed has six products**, so "Pokaż więcej" does not appear. The
  pagination is implemented and tested; seeing it in the browser needs more data, not a smaller
  page.
