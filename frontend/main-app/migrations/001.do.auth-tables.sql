create table if not exists tenant
(
    id   ltree not null,
    name text  not null,
    primary key (id)
);

create index tenant_idx on tenant using gist (id);

create table if not exists users
(
    id         text      not null,
    user_pool  ltree     not null,
    tenant     ltree     not null,
    email      text      not null,
    first_name text      null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    primary key (id, user_pool)
);

-- user.tenant should reference a row in the tenant table
alter table users
    add constraint users_tenant_fk foreign key (tenant) references tenant (id) on delete cascade;

create index users_user_poolx on users using gist (user_pool);

create index users_tenantx on users using gist (tenant);

-- create a table to store refresh tokens
create table if not exists refresh_token
(
    id            text      not null,
    user_id       text      not null,
    user_pool     ltree     not null,
    refresh_token text      not null,
    created_at    timestamp not null default now(),
    updated_at    timestamp not null default now(),
    primary key (id)
);

-- refresh_token should reference a row in the user table
alter table refresh_token
    add constraint refresh_token_user_fk foreign key (user_id, user_pool) references users (id, user_pool) on delete cascade;
-- refresh_token foreign key fields should have an index
create index refresh_token_userx on refresh_token (user_id, user_pool);