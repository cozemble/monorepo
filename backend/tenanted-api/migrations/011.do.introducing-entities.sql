create table if not exists tenant_entity
(
    env        text      not null,
    id         text      not null,
    tenant     ltree     not null,
    name       text      not null,
    type       text      not null,
    definition jsonb     not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    primary key (env, id, tenant)
);

create index if not exists tenant_entity_env_idx on tenant_entity (env);

-- create index on tenant column as gist index
create index if not exists tenant_entity_tenant_gist_idx
    on tenant_entity using gist (tenant);

-- should refer to tenant via foreign key
alter table tenant_entity
    add constraint tenant_entity_tenant_fkey
        foreign key (env, tenant)
            references tenant (env, id)
            on delete cascade;

CREATE OR REPLACE FUNCTION upsert_tenant_entity_from_jsonb_array(given_env text, tenant_value ltree, jsonb_array JSONB[])
    RETURNS VOID AS
$$
DECLARE
    json_item JSONB;
BEGIN
    -- Loop through the array
    FOREACH json_item IN ARRAY jsonb_array
        LOOP
            -- Upsert each item from the JSONB array into the tenant_entity table
            INSERT INTO tenant_entity (env, id, tenant, name, type, definition)
            VALUES (given_env,
                    json_item -> 'id' ->> 'value', -- Extract the id
                    tenant_value, -- Use the provided tenant value
                    json_item -> 'name' ->> 'value', -- Extract the name
                    json_item ->> '_type', -- Extract the type
                    json_item -- Use the whole JSONB item as definition
                   )
            ON CONFLICT (env,id, tenant) DO UPDATE SET name       = EXCLUDED.name,
                                                   type       = EXCLUDED.type,
                                                   definition = EXCLUDED.definition,
                                                   updated_at = NOW();
        END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tenant_entities_definitions(given_env text, tenant_value ltree)
    RETURNS JSONB AS
$$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(definition)
    INTO result
    FROM tenant_entity
    WHERE tenant = tenant_value and env = given_env;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION current_user_has_access_to_tenant(given_env text, tenant_id ltree)
    RETURNS BOOLEAN AS
$$
BEGIN
    RETURN EXISTS(SELECT 1
                  FROM user_tenancy
                  WHERE user_id = get_jwt_claim_sub()
                    AND env = given_env
                    AND tenant_id <@ tenant);
END;
$$ LANGUAGE plpgsql;

CREATE POLICY tenant_entity_insert_policy
    ON tenant_entity
    FOR INSERT
    WITH CHECK (current_user_has_access_to_tenant(env,tenant));

CREATE POLICY tenant_entity_select_policy
    ON tenant_entity
    FOR SELECT
    TO PUBLIC
    USING (current_user_has_access_to_tenant(env,tenant));

CREATE POLICY tenant_entity_update_policy
    ON tenant_entity
    FOR UPDATE
    TO PUBLIC
    USING (current_user_has_access_to_tenant(env,tenant));

CREATE POLICY tenant_entity_delete_policy
    ON tenant_entity
    FOR DELETE
    TO PUBLIC
    USING (current_user_has_access_to_tenant(env,tenant));

ALTER TABLE tenant_entity
    ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_tenant_info(given_env text, tenant_id ltree)
    RETURNS json
AS
$$
BEGIN
    RETURN (SELECT json_build_object(
                           'id', t.id,
                           'name', t.name,
                           'models', (COALESCE((SELECT json_agg(m.definition)
                                                FROM model m
                                                WHERE m.tenant = t.id and m.env = t.env), '[]')),
                           'entities', (COALESCE((SELECT json_agg(te.definition)
                                                  FROM tenant_entity te
                                                  WHERE te.tenant = t.id and te.env = t.env), '[]')),
                           'events', (COALESCE((SELECT json_agg(me.definition)
                                                FROM model_event me
                                                WHERE me.tenant = t.id and me.env = t.env), '[]'))
                       )
            FROM tenant t
            WHERE t.id = tenant_id and t.env = given_env
            GROUP BY t.id, t.env);
END;
$$ LANGUAGE plpgsql;
