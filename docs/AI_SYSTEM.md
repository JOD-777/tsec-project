# AI system

`POST /api/intent` validates requests and performs server-only OpenRouter structured extraction when a key is configured. Responses are validated with Zod. Provider errors, timeouts or invalid output fall back to a deterministic intent for the seeded workflow. AI never marks a claim as government-verified; verification is a distinct data field.
