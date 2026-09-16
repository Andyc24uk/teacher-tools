create or replace function public.portal_admin_set_student_password(p_student_number text, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if length(p_password) < 8 then
    raise exception 'Password must be at least 8 characters';
  end if;

  update public.students
  set password_hash = crypt(p_password, gen_salt('bf', 12)), updated_at = now()
  where student_number = trim(p_student_number) and active = true;

  return found;
end;
$$;

revoke all on function public.portal_admin_set_student_password(text,text) from public, anon, authenticated;
grant execute on function public.portal_admin_set_student_password(text,text) to service_role;
