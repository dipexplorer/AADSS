-- STUDENT PROFILE
create table student_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  session text not null,
  program text not null,
  semester int not null,
  created_at timestamp default now()
);

-- SUBJECTS
create table subjects (
  id uuid primary key default uuid_generate_v4(),
  semester int not null,
  name text not null,
  min_attendance_required int default 75,
  created_at timestamp default now()
);

-- TIMETABLE
create table timetable (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid references subjects(id) on delete cascade,
  day_of_week int not null, -- 0=Sunday
  start_time time not null,
  end_time time not null,
  room text,
  latitude double precision,
  longitude double precision,
  allowed_radius int default 100,
  created_at timestamp default now()
);

-- CLASS SESSIONS (GENERATED)
create table class_sessions (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid references subjects(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'scheduled',
  created_at timestamp default now()
);

-- ATTENDANCE
create table attendance (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references student_profiles(id) on delete cascade,
  session_id uuid references class_sessions(id) on delete cascade,
  status text check (status in ('present', 'absent', 'cancelled')),
  marked_at timestamp default now(),
  latitude double precision,
  longitude double precision,
  unique(student_id, session_id)
);

-- NOTES
create table notes (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references student_profiles(id) on delete cascade,
  date date not null,
  content jsonb,
  created_at timestamp default now()
);