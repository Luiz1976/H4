-- Create instagram_accounts table
create table if not exists public.instagram_accounts (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    access_token text not null,
    instagram_business_id text,
    page_id text,
    token_expires_at timestamptz,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    primary key (id)
);

-- Create instagram_posts table
create table if not exists public.instagram_posts (
    id uuid not null default gen_random_uuid(),
    account_id uuid not null references public.instagram_accounts(id) on delete cascade,
    image_url text not null,
    caption text,
    status text check (status in ('scheduled', 'published', 'failed')) default 'scheduled',
    scheduled_at timestamptz,
    published_at timestamptz,
    error_message text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    primary key (id)
);

-- Create instagram_logs table
create table if not exists public.instagram_logs (
    id uuid not null default gen_random_uuid(),
    account_id uuid references public.instagram_accounts(id) on delete set null,
    action text not null,
    status text not null,
    details jsonb,
    created_at timestamptz default now(),
    primary key (id)
);

-- Enable RLS
alter table public.instagram_accounts enable row level security;
alter table public.instagram_posts enable row level security;
alter table public.instagram_logs enable row level security;

-- Create policies
create policy "Users can view their own instagram accounts"
    on public.instagram_accounts for select
    using (auth.uid() = user_id);

create policy "Users can update their own instagram accounts"
    on public.instagram_accounts for update
    using (auth.uid() = user_id);

create policy "Users can view their own instagram posts"
    on public.instagram_posts for select
    using (exists (
        select 1 from public.instagram_accounts a
        where a.id = instagram_posts.account_id
        and a.user_id = auth.uid()
    ));

create policy "Users can insert instagram posts"
    on public.instagram_posts for insert
    with check (exists (
        select 1 from public.instagram_accounts a
        where a.id = account_id
        and a.user_id = auth.uid()
    ));

-- Grant access to service role (for edge functions)
grant all on public.instagram_accounts to service_role;
grant all on public.instagram_posts to service_role;
grant all on public.instagram_logs to service_role;
