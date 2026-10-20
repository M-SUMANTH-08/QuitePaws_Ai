# QuietPaws — Backend & Data Schema

## Decision: no backend for the ML loop
The prototype does not need a database, load balancer, database connection pool, API response cache, or server-side inference. Adding these would increase attack surface and complexity without improving the offline demo.

Vercel serves the static site and can optionally provide serverless endpoints later.

## Optional health endpoint
A minimal `/api/health` endpoint may be added for deployment smoke tests. It must not receive camera frames, microphone audio, or user secrets.

Example response:
```json
{
  "ok": true,
  "service": "quietpaws-web",
  "version": "4.0.0"
}
```

## Session event schema
The local session log uses the following conceptual schema:
```json
{
  "id": "client-generated-id",
  "timestamp": "ISO-8601",
  "state": "ATTENTION_SEEKING",
  "meetingMode": true,
  "workspace": true,
  "approach": true,
  "cue": "Owner Voice",
  "attempt": 1,
  "outcome": "SUCCESS",
  "response": {
    "movedAway": true,
    "outsideWorkspace": true,
    "relativeDistance": "increased"
  },
  "simulated": false
}
```

## Persistence
Browser prototype: localStorage.
Native target: SQLite/Room candidate.

## Database indexing
N/A for the current localStorage prototype.
If multi-user persistence is introduced later, index by `user_id`, `session_id`, and `timestamp`.

## Connection pooling
N/A because there is no database connection.

## API response caching
N/A for ML. Model/CDN delivery is handled by browser/CDN caching and Vercel infrastructure.

## Secrets
No API keys belong in frontend code. If a future backend needs secrets, store them as Vercel environment variables and access them only from server-side functions.

## Analytics
Vercel Web Analytics is separate from the ML session data. Do not send camera frames, microphone audio, owner voice recordings, or raw session content to analytics.
