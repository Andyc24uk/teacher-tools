revoke all on function public.portal_login(text,text) from anon, authenticated;
revoke all on function public.portal_logout(text) from anon, authenticated;
revoke all on function public.portal_dashboard(text) from anon, authenticated;
revoke all on function public.portal_authorize_work(text,uuid) from anon, authenticated;
revoke all on function public.portal_record_opened(text,uuid,text) from anon, authenticated;
revoke all on function public.portal_record_finished(text,uuid) from anon, authenticated;

grant execute on function public.portal_login(text,text) to service_role;
grant execute on function public.portal_logout(text) to service_role;
grant execute on function public.portal_dashboard(text) to service_role;
grant execute on function public.portal_authorize_work(text,uuid) to service_role;
grant execute on function public.portal_record_opened(text,uuid,text) to service_role;
grant execute on function public.portal_record_finished(text,uuid) to service_role;
