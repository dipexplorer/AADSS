-- Insert Program
insert into programs (name)
values ('B.Tech CSE')
returning id;

--  Insert Semester
insert into semesters (program_id, semester_number)
values (
  (select id from programs where name = 'B.Tech CSE' limit 1),
  5
)
returning id;

--  Insert Academic Session
insert into academic_sessions (name, start_date, end_date)
values (
  '2025-2026',
  '2025-01-01',
  '2025-12-31'
)
returning id;

-- Insert Subjects
insert into subjects (semester_id, name)
values
(
  (select s.id from semesters s
   join programs p on s.program_id = p.id
   where p.name = 'B.Tech CSE' and s.semester_number = 5
   limit 1),
  'DBMS'
),
(
  (select s.id from semesters s
   join programs p on s.program_id = p.id
   where p.name = 'B.Tech CSE' and s.semester_number = 5
   limit 1),
  'Operating Systems'
),
(
  (select s.id from semesters s
   join programs p on s.program_id = p.id
   where p.name = 'B.Tech CSE' and s.semester_number = 5
   limit 1),
  'Computer Networks'
),
(
  (select s.id from semesters s
   join programs p on s.program_id = p.id
   where p.name = 'B.Tech CSE' and s.semester_number = 5
   limit 1),
  'Theory of Computation'
);


-- Insert Timetable
insert into timetable (
  subject_id,
  day_of_week,
  start_time,
  end_time,
  room,
  allowed_radius
)
values

-- DBMS
(
  (select id from subjects where name = 'DBMS' limit 1),
  1, '09:00', '10:00', 'A101', 100
),
(
  (select id from subjects where name = 'DBMS' limit 1),
  3, '11:00', '12:00', 'A101', 100
),

-- OS
(
  (select id from subjects where name = 'Operating Systems' limit 1),
  2, '10:00', '11:00', 'B201', 100
),

-- CN
(
  (select id from subjects where name = 'Computer Networks' limit 1),
  4, '09:00', '10:00', 'C301', 100
),

-- TOC
(
  (select id from subjects where name = 'Theory of Computation' limit 1),
  5, '12:00', '13:00', 'D401', 100
);