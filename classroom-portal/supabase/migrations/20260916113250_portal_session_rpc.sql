-- Applied to live pilot project. Provides opaque student sessions and session-scoped dashboard/work RPCs.
-- See Supabase migration history for canonical applied version.

-- portal_login(student number, password): verifies pgcrypto hash, stores only SHA-256 session-token hash.
-- portal_logout(token): revokes current opaque session.
-- portal_dashboard(token): returns only the authenticated student's classes/groups/work.
-- portal_authorize_work(token, work id): prevents cross-student file access.
-- portal_record_opened(token, work id, permission id): tracks first/last open and in-progress state.
-- portal_record_finished(token, work id): marks work finished; anonymous permission remains until teacher closes School Mode.

-- These RPCs are granted to anon/authenticated. Base tables remain inaccessible through RLS.
