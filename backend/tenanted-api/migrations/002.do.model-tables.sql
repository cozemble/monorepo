create table if not exists model
(
    id         text      not null,
    tenant     ltree     not null,
    name       text      not null,
    definition jsonb     not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
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

CREATE OR REPLACE FUNCTION post_tenant(tenant_id_value ltree, tenant_name_value text)
    RETURNS void
AS
$$
DECLARE
BEGIN
    insert into tenant(id, name) values (tenant_id_value, tenant_name_value);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tenant_info(tenant_id ltree)
    RETURNS json
AS
$$
BEGIN
    RETURN (SELECT json_build_object(
                           'id', t.id,
                           'name', t.name,
                           'models', COALESCE(
                                   json_agg(
                                           json_build_object(
                                                   'id', m.id,
                                                   'name', m.name,
                                                   'definition', m.definition,
                                                   'events', COALESCE(
                                                           (SELECT json_agg(json_build_object(
                                                                   'id', me.id,
                                                                   'definition', me.definition))
                                                            FROM model_event me
                                                            WHERE me.model_id = m.id), '[]'::json)
                                               )
                                       ),
                                   '[]'::json
                               )
                       )
            FROM tenant t
                     LEFT JOIN model m ON t.id = m.tenant
            WHERE t.id = tenant_id
            GROUP BY t.id);
END;
$$ LANGUAGE plpgsql;
;

CREATE OR REPLACE FUNCTION put_tenant_info(tenant_info json)
    RETURNS void
AS
$$
DECLARE
    tenant_id_var      text;
    model_id_var       text;
    model_event_id_var text;
    model_info         json;
    event_info         json;
    event_definition   json;
    i                  int;
BEGIN
    -- Get the tenant ID from the JSON
    tenant_id_var := tenant_info ->> 'id';

    -- Loop over the models and insert them
    FOR i IN 0 .. json_array_length(tenant_info -> 'models') - 1
        LOOP
            -- Get the model object from the JSON array
            model_info := (tenant_info -> 'models') -> i;

            -- Get the model ID from the model object
            model_id_var := model_info ->> 'id';

            delete from model_event me where me.model_id = model_id_var;
            delete from model where id = model_id_var;

            -- Insert the model
            INSERT INTO model (id, name, definition, tenant)
            VALUES (model_id_var, model_info ->> 'name', (model_info ->> 'definition')::jsonb, tenant_id_var::ltree);

            -- Loop over the model events and insert them
            FOR j IN 0 .. json_array_length(model_info -> 'events') - 1
                LOOP
                    -- Get the model event object from the JSON array
                    event_info := (model_info -> 'events') -> j;
                    event_definition := (event_info ->> 'definition')::jsonb;
                    model_event_id_var := event_info ->> 'id';

                    -- Insert the model event
                    INSERT INTO model_event (id, definition, model_id, tenant)
                    VALUES (model_event_id_var, event_definition, model_id_var,
                            tenant_id_var::ltree);
                END LOOP;
        END LOOP;
END;
$$ LANGUAGE plpgsql;

