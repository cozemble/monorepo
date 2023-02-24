create table if not exists model
(
    id         text      not null,
    tenant     ltree     not null,
    height     int       not null,
    name       text      not null,
    definition jsonb     not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    primary key (id, tenant)
);

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
    height     int       not null,
    definition jsonb     not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    primary key (id, model_id, tenant)
);

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