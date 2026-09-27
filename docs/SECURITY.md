# Security

- No secret or service-role credential is exposed through a `NEXT_PUBLIC_` variable.
- Every public-schema table has RLS enabled.
- Private user rows require `auth.uid()` ownership; update policies include `WITH CHECK`.
- Canonical civic knowledge has public read policies but no browser write policy.
- User documents use private buckets and first-path-segment ownership policies.
- AI input is length-limited and schema validated; AI output is validated before use.
- The judge demo never fetches arbitrary user-provided URLs and therefore avoids SSRF exposure.
- External government links use safe new-tab attributes.
