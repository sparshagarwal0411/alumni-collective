create type public.app_role as enum ('admin','alumni','student');

create table public.profiles (
  id uuid primary key,
  full_name text not null default '',
  headline text,
  grad_year int,
  degree text,
  department text,
  company text,
  role_title text,
  city text,
  bio text,
  skills text[] not null default '{}',
  open_to_mentor boolean not null default false,
  linkedin text,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable" on public.profiles for select to anon, authenticated using (true);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id and is_sample = false);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'alumni');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null,
  addressee uuid not null,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  unique (requester, addressee)
);
grant select on public.connections to anon, authenticated;
grant insert, update, delete on public.connections to authenticated;
grant all on public.connections to service_role;
alter table public.connections enable row level security;
create policy "accepted connections public" on public.connections for select to anon, authenticated using (status = 'accepted' or auth.uid() in (requester, addressee));
create policy "request connection" on public.connections for insert to authenticated with check (auth.uid() = requester and status = 'pending');
create policy "addressee responds" on public.connections for update to authenticated using (auth.uid() = addressee);
create policy "party removes" on public.connections for delete to authenticated using (auth.uid() in (requester, addressee));

create table public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  mentee uuid not null,
  mentor uuid not null,
  topic text not null,
  message text,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.mentorship_requests to authenticated;
grant all on public.mentorship_requests to service_role;
alter table public.mentorship_requests enable row level security;
create policy "parties read" on public.mentorship_requests for select to authenticated using (auth.uid() in (mentee, mentor));
create policy "mentee creates" on public.mentorship_requests for insert to authenticated with check (auth.uid() = mentee and status = 'pending');
create policy "mentor responds" on public.mentorship_requests for update to authenticated using (auth.uid() = mentor);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null,
  recipient uuid not null,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
grant select, insert on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "parties read msgs" on public.messages for select to authenticated using (auth.uid() in (sender, recipient));
create policy "send as self" on public.messages for insert to authenticated with check (auth.uid() = sender);
alter publication supabase_realtime add table public.messages;

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid,
  title text not null,
  company text not null,
  kind text not null default 'full-time' check (kind in ('full-time','internship','contract','part-time')),
  location text,
  url text,
  description text,
  referral_available boolean not null default false,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.jobs to anon, authenticated;
grant insert, update, delete on public.jobs to authenticated;
grant all on public.jobs to service_role;
alter table public.jobs enable row level security;
create policy "jobs public" on public.jobs for select to anon, authenticated using (true);
create policy "post job" on public.jobs for insert to authenticated with check (auth.uid() = posted_by and is_sample = false);
create policy "edit own job" on public.jobs for update to authenticated using (auth.uid() = posted_by);
create policy "delete own job" on public.jobs for delete to authenticated using (auth.uid() = posted_by or public.has_role(auth.uid(),'admin'));

create table public.referral_requests (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  requester uuid not null,
  referrer uuid not null,
  note text,
  status text not null default 'pending' check (status in ('pending','referred','declined')),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.referral_requests to authenticated;
grant all on public.referral_requests to service_role;
alter table public.referral_requests enable row level security;
create policy "ref parties read" on public.referral_requests for select to authenticated using (auth.uid() in (requester, referrer));
create policy "ref create" on public.referral_requests for insert to authenticated with check (auth.uid() = requester and status = 'pending');
create policy "ref respond" on public.referral_requests for update to authenticated using (auth.uid() = referrer);

create table public.microtasks (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid,
  title text not null,
  description text,
  hours numeric(4,1),
  status text not null default 'open' check (status in ('open','claimed','done')),
  claimed_by uuid,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.microtasks to anon, authenticated;
grant insert, update on public.microtasks to authenticated;
grant all on public.microtasks to service_role;
alter table public.microtasks enable row level security;
create policy "tasks public" on public.microtasks for select to anon, authenticated using (true);
create policy "post task" on public.microtasks for insert to authenticated with check (auth.uid() = posted_by and is_sample = false);
create policy "claim or manage task" on public.microtasks for update to authenticated
  using (auth.uid() = posted_by or (status = 'open' and is_sample = false) or auth.uid() = claimed_by)
  with check (auth.uid() = posted_by or auth.uid() = claimed_by);

create table public.funds (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  summary text,
  goal_amount int not null,
  raised_amount int not null default 0,
  currency text not null default 'INR',
  is_sample boolean not null default true,
  sort int not null default 0
);
grant select on public.funds to anon, authenticated;
grant all on public.funds to service_role;
alter table public.funds enable row level security;
create policy "funds public" on public.funds for select to anon, authenticated using (true);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_subscribers to anon, authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "anyone subscribes" on public.newsletter_subscribers for insert to anon, authenticated with check (true);

create table public.updates (
  id uuid primary key default gen_random_uuid(),
  author uuid,
  category text not null default 'News',
  title text not null,
  body text not null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.updates to anon, authenticated;
grant insert, delete on public.updates to authenticated;
grant all on public.updates to service_role;
alter table public.updates enable row level security;
create policy "updates public" on public.updates for select to anon, authenticated using (true);
create policy "admins post" on public.updates for insert to authenticated with check (public.has_role(auth.uid(),'admin') and auth.uid() = author);
create policy "admins delete" on public.updates for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Sample data (flagged is_sample)
insert into public.profiles (id, full_name, headline, grad_year, degree, department, company, role_title, city, bio, skills, open_to_mentor, is_sample) values
('00000000-0000-0000-0000-000000000001','Ananya Rao','Building payments infrastructure',2012,'B.Tech','Computer Science','Razorpay','Principal Engineer','Bengaluru','Works on distributed ledgers. Mentors students moving from campus to industry.','{Distributed Systems,Go,Mentoring}',true,true),
('00000000-0000-0000-0000-000000000002','Kabir Mehta','Climate policy & finance',2009,'B.A.','Economics','World Bank','Senior Economist','Washington DC','Leads climate-adaptation lending programmes across South Asia.','{Policy,Climate Finance,Research}',true,true),
('00000000-0000-0000-0000-000000000003','Ishita Sen','Product design, quietly',2016,'B.Des','Design','Figma','Product Designer','London','Designs collaboration tools. Former editor of the college magazine.','{Interaction Design,Typography,Research}',true,true),
('00000000-0000-0000-0000-000000000004','Rohan Pillai','Oncology research',2011,'M.Sc','Biotechnology','Tata Memorial','Research Scientist','Mumbai','Works on early detection of oral cancers.','{Genomics,Lab Research,Writing}',false,true),
('00000000-0000-0000-0000-000000000005','Meera Iyer','Founder, small-batch textiles',2014,'B.Com','Commerce','Iyer & Loom','Founder','Chennai','Runs a craft label working with 40 weaver families.','{Entrepreneurship,Supply Chain,Brand}',true,true),
('00000000-0000-0000-0000-000000000006','Arjun Khanna','Machine learning at scale',2018,'B.Tech','Computer Science','Google DeepMind','Research Engineer','London','Works on evaluation of large language models.','{Machine Learning,Python,Evaluation}',true,true),
('00000000-0000-0000-0000-000000000007','Sana Qureshi','Litigation & public interest law',2010,'B.A. LL.B','Law','Supreme Court of India','Advocate','New Delhi','Practises constitutional law; teaches a weekend clinic.','{Litigation,Constitutional Law}',false,true),
('00000000-0000-0000-0000-000000000008','Dev Malhotra','Venture investing',2013,'B.Tech','Mechanical Engineering','Peak XV','Partner','Bengaluru','Invests in early-stage climate and deep-tech companies.','{Venture Capital,Hardware,Strategy}',true,true);

insert into public.connections (requester, addressee, status) values
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000006','accepted'),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000008','accepted'),
('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000007','accepted'),
('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000005','accepted'),
('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000008','accepted'),
('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000002','accepted'),
('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000008','accepted'),
('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000006','accepted');

insert into public.jobs (posted_by, title, company, kind, location, description, referral_available, is_sample) values
('00000000-0000-0000-0000-000000000001','Backend Engineer, Ledger','Razorpay','full-time','Bengaluru','Design and operate core money-movement services.',true,true),
('00000000-0000-0000-0000-000000000003','Design Intern, Summer','Figma','internship','London · Remote','Twelve weeks on the FigJam team.',true,true),
('00000000-0000-0000-0000-000000000002','Research Assistant, Climate','World Bank','contract','Remote','Six-month data and literature work on adaptation finance.',false,true),
('00000000-0000-0000-0000-000000000008','Investment Analyst','Peak XV','full-time','Bengaluru','Support diligence on deep-tech investments.',true,true);

insert into public.microtasks (posted_by, title, description, hours, is_sample) values
('00000000-0000-0000-0000-000000000005','Review a pitch deck','Twenty slides for a seed round; looking for blunt feedback.',1.5,true),
('00000000-0000-0000-0000-000000000004','Proofread a grant abstract','300 words, scientific English.',0.5,true),
('00000000-0000-0000-0000-000000000003','Usability test a prototype','Thirty-minute recorded session over video.',0.5,true);

insert into public.funds (slug, name, summary, goal_amount, raised_amount, sort) values
('scholarships','First-Generation Scholarships','Full tuition and living support for students who are the first in their family to attend university.',5000000,3120000,1),
('library','The Reading Room Restoration','Restoring the 1931 library hall, its timber stacks and rare-book archive.',2500000,940000,2),
('research','Undergraduate Research Grants','Small grants that let undergraduates run their first independent study.',1200000,860000,3);

insert into public.updates (category, title, body, is_sample, created_at) values
('Reunion','Class of 2016 returns for its tenth','Over two hundred alumni are expected on campus this December for a weekend of lectures, walks and the founders'' dinner.',true, now() - interval '3 days'),
('Campus','The Reading Room reopens its east wing','After eighteen months of restoration, the east wing''s timber stacks are open to students again.',true, now() - interval '12 days'),
('Alumni','Ananya Rao named to national fintech council','The 2012 Computer Science graduate will advise on open payment standards.',true, now() - interval '20 days');