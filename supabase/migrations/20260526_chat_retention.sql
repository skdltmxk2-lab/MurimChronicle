-- 실시간 채팅: 6시간 지난 메시지 자동 삭제 (pg_cron)
-- Supabase 대시보드 → Database → Extensions 에서 pg_cron 을 먼저 활성화한 뒤,
-- SQL 에디터에서 아래를 실행하세요.

create extension if not exists pg_cron;

-- 기존 작업이 있으면 제거(재실행 안전)
do $$
begin
  perform cron.unschedule('purge-old-chat-messages');
exception when others then null;
end $$;

-- 10분마다 6시간 이전 메시지 삭제
select cron.schedule(
  'purge-old-chat-messages',
  '*/10 * * * *',
  $$delete from chat_messages where created_at < now() - interval '6 hours'$$
);
