-- إضافة حقول وقت فتح/إغلاق موحدة للصيدليات المناوبة (تدعم المناوبات التي تمتد حتى اليوم التالي)
-- open_time/close_time يُخزّنان كـ time، وعندما يكون close_time < open_time يُفسّر بأن الإغلاق في اليوم التالي

alter table if exists public.duty_pharmacies
add column if not exists open_time time,
add column if not exists close_time time;
