create or replace function public.portal_record_finished(p_token text, p_work_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_student_id uuid;
begin
  select ps.student_id into v_student_id
  from public.portal_sessions ps
  where ps.token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and ps.revoked_at is null and ps.expires_at > now()
  order by ps.created_at desc limit 1;
  if v_student_id is null then return false; end if;

  update public.student_work
  set status = 'finished', finished_at = now(), updated_at = now()
  where id = p_work_id and student_id = v_student_id;
  return found;
end;
$$;

revoke all on function public.portal_record_finished(text,uuid) from public;
grant execute on function public.portal_record_finished(text,uuid) to anon, authenticated;
