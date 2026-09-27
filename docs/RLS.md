# Row-level security

Citizens can read and update only their own profiles, goals, workflows, workflow states and documents. Roles are readable only by their owner and are never client-writable. Public access is limited to taxonomy, source registry metadata, public services and published procedures. Admin/change-review writes are designed to run in an authenticated server boundary with an audit event.
