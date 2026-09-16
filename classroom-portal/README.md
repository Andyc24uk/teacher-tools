# Classroom Portal MVP

Hybrid School Mode for the Grade 3-1 pilot. Students use Portal credentials at school while their canonical Google Slides/Docs remain shareable to their existing Google identity for normal home/Classroom use.

## v0.2 pilot workflow

1. Teacher connects Google through OAuth.
2. Teacher sets/resets a Portal password for each pilot student.
3. Teacher clicks **Open School Mode** before the lesson.
   - each mapped student file receives a temporary `anyone / writer` Drive permission;
   - each file is also shared directly to the student's existing Google email as `writer`.
4. Student signs into Portal using student number + Portal password.
5. Portal authorizes only that student's own `student_work` row and opens its canonical Slides file.
6. Students can mark work **Finished**; Portal tracks status independently from Google Classroom Turn In.
7. Teacher clicks **Close School Mode** after the lesson.
   - anonymous editor permissions are removed;
   - named Google-user access remains for home use.
8. Google Classroom coursework/submission attachment is the next integration phase after this loop is proven.

## Security model

- Personal Google passwords are never collected.
- Student Portal passwords are one-way hashed in Postgres using `pgcrypto`.
- Student sessions are opaque random tokens; only hashes are stored in Supabase.
- Base tables use Row Level Security and have no browser-readable table policies.
- Student-facing access goes through narrow RPC functions that validate the opaque session token.
- Teacher admin routes require the server-side Supabase service-role key and a connected teacher Google session.
- Google OAuth tokens are encrypted into a short-lived HTTP-only teacher cookie for this pilot.
- Anonymous Drive editing is lesson-scoped: open before class, close after class.

## Environment

Copy `.env.example` to `.env.local` for local development. Never commit the service-role key, Google client secret, or session secret.

The production deployment needs:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORTAL_SESSION_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `PILOT_ASSIGNMENT_ID`

## Current pilot

- Supabase project: `emyospjrslxqwdgtnbvv`
- Grade: 3-1
- Group: A
- Pilot assignment: `2b9c699e-43c7-412f-a480-f328543a2c1f`
- Seven canonical student Slides files have already been created and mapped in `student_work`.

## Live Supabase migrations

- `20260916111015 initial_classroom_portal_schema`
- `20260916111039 harden_updated_at_function`
- `20260916113250 portal_session_rpc`
- `20260916113537 portal_admin_password_reset`
- `20260916113838 keep_school_permission_until_teacher_close`

## Next milestone

Deploy the app, configure OAuth against the Google Cloud project we intend to share with GCPM, set test Portal passwords through the teacher UI, then prove **Open School Mode -> student login -> edit correct Slides copy -> Close School Mode** for the seven dummy students.
