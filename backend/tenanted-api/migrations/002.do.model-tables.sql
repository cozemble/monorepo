create table if not exists model
(
    id           text      not null,
    tenant       ltree     not null,
    name         text      not null,
    definition   jsonb     not null,
    unique_paths text[]    not null,
    created_at   timestamp not null default now(),
    updated_at   timestamp not null default now(),
    primary key (id, tenant)
);

-- create index on tenant column as gist index
create index if not exists model_tenant_gist_idx
    on model using gist (tenant);

-- model should refer to tenant via foreign key
alter table model
    add constraint model_tenant_fkey
        foreign key (tenant)
            references tenant (id)
            on delete cascade;

create table if not exists model_event
(
    id         text      not null,
    model_id   text      not null,
    tenant     ltree     not null,
    definition jsonb     not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    primary key (id, model_id, tenant)
);

-- create index on tenant column as gist index
create index if not exists model_event_tenant_gist_idx
    on model_event using gist (tenant);

-- model event should refer to model via foreign key
alter table model_event
    add constraint model_event_model_id_fkey
        foreign key (model_id, tenant)
            references model (id, tenant)
            on delete cascade;

-- model event should refer to tenant via foreign key
alter table model_event
    add constraint model_event_tenant_fkey
        foreign key (tenant)
            references tenant (id)
            on delete cascade;

CREATE OR REPLACE FUNCTION post_tenant(tenant_id_value ltree, tenant_name_value text, user_pool_value ltree,
                                       owner_id_value text, email_address_value text, first_name_value text)
    RETURNS void
AS
$$
DECLARE
    user_id_value text;
BEGIN
    -- Insert new user
    insert into users(id, user_pool, email, first_name)
    values (owner_id_value, user_pool_value, email_address_value, first_name_value)
    returning id into user_id_value;

    -- Insert new tenant if it doesn't exist
    insert into tenant(id, name) values (tenant_id_value, tenant_name_value);

    -- Insert join between user and tenant
    insert into user_tenancy(user_id, tenant) values (user_id_value, tenant_id_value);

END;
$$ LANGUAGE plpgsql;
