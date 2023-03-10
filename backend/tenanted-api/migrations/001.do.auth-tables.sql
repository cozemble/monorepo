create extension if not exists ltree;

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
    email      text      not null,
    first_name text      null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    primary key (id, user_pool)
);


create index users_user_poolx on users using gist (user_pool);

-- create a table to map users to tenants, with a array of roles
create table if not exists user_tenancy
(
    user_id text  not null,
    tenant  ltree not null,
    roles   text[] default array []::text[],
    primary key (user_id, tenant)
);

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

CREATE OR REPLACE FUNCTION register_user(given_user_pool ltree, given_email text, given_first_name text)
    RETURNS json AS
$$
DECLARE
    user_id text;
    tenant  ltree;
BEGIN
    select gen_random_uuid()::text into user_id;
    select text2ltree(ltree2text(given_user_pool) || '.tenant.' || translate(gen_random_uuid()::text, '-', ''))
    into tenant;

    insert into tenant(id, name) values (tenant, 'Default tenant');
    insert into users(id, user_pool, email, first_name)
    values (user_id, given_user_pool, given_email, given_first_name);
    insert into user_tenancy(user_id, tenant, roles) values (user_id, tenant, array ['owner']);

    return get_user_by_id(given_user_pool, user_id);
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_by_id(given_user_pool ltree, given_user_id text)
    RETURNS json AS
$$
SELECT json_build_object(
               'user_id', u.id,
               'first_name', u.first_name,
               'tenants', json_agg(json_build_object(
                'tenant_name', t.name,
                'tenant_id', t.id,
                'roles', ut.roles
            ))
           ) AS user_tenancy
FROM users u
         JOIN user_tenancy ut ON u.id = ut.user_id
         JOIN tenant t ON t.id = ut.tenant
WHERE u.id = given_user_id
  and u.user_pool = given_user_pool
GROUP BY u.id, u.first_name;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_user_by_email(given_user_pool ltree, given_email text)
    RETURNS json AS
$$
SELECT json_build_object(
               'user_id', u.id,
               'first_name', u.first_name,
               'email', u.email,
               'tenants', json_agg(json_build_object(
                'tenant_name', t.name,
                'tenant_id', t.id,
                'roles', ut.roles
            ))
           ) AS user_tenancy
FROM users u
         JOIN user_tenancy ut ON u.id = ut.user_id
         JOIN tenant t ON t.id = ut.tenant
WHERE u.email = given_email
  and u.user_pool = given_user_pool
GROUP BY u.id, u.first_name, u.email
$$ LANGUAGE SQL;
