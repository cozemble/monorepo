create table if not exists tenant_entity
(
    id         text      not null,
    tenant     ltree     not null,
    name       text      not null,
    type       text      not null,
    definition jsonb     not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    primary key (id, tenant)
);

-- create index on tenant column as gist index
create index if not exists tenant_entity_tenant_gist_idx
    on tenant_entity using gist (tenant);

-- should refer to tenant via foreign key
alter table tenant_entity
    add constraint tenant_entity_tenant_fkey
        foreign key (tenant)
            references tenant (id)
            on delete cascade;

CREATE OR REPLACE FUNCTION upsert_tenant_entity_from_jsonb_array(tenant_value ltree, jsonb_array JSONB[])
    RETURNS VOID AS
$$
DECLARE
    json_item JSONB;
BEGIN
    -- Loop through the array
    FOREACH json_item IN ARRAY jsonb_array
        LOOP
            -- Upsert each item from the JSONB array into the tenant_entity table
            INSERT INTO tenant_entity (id, tenant, name, type, definition)
            VALUES (json_item -> 'id' ->> 'value', -- Extract the id
                    tenant_value, -- Use the provided tenant value
                    json_item -> 'name' ->> 'value', -- Extract the name
                    json_item ->> '_type', -- Extract the type
                    json_item -- Use the whole JSONB item as definition
                   )
            ON CONFLICT (id, tenant) DO UPDATE SET name       = EXCLUDED.name,
                                                   type       = EXCLUDED.type,
                                                   definition = EXCLUDED.definition,
                                                   updated_at = NOW();
        END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tenant_entities_definitions(tenant_value ltree)
    RETURNS JSONB AS
$$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(definition)
    INTO result
    FROM tenant_entity
    WHERE tenant = tenant_value;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION current_user_has_access_to_tenant(tenant_id ltree)
    RETURNS BOOLEAN AS
$$
BEGIN
    RETURN EXISTS(
            SELECT 1
            FROM user_tenancy
            WHERE user_id = get_jwt_claim_sub()
              AND tenant_id <@ tenant
        );
END;
$$ LANGUAGE plpgsql;

CREATE POLICY tenant_entity_insert_policy
    ON tenant_entity
    FOR INSERT
    WITH CHECK (current_user_has_access_to_tenant(tenant));

CREATE POLICY tenant_entity_select_policy
    ON tenant_entity
    FOR SELECT
    TO PUBLIC
    USING (current_user_has_access_to_tenant(tenant));

CREATE POLICY tenant_entity_update_policy
    ON tenant_entity
    FOR UPDATE
    TO PUBLIC
    USING (current_user_has_access_to_tenant(tenant));

CREATE POLICY tenant_entity_delete_policy
    ON tenant_entity
    FOR DELETE
    TO PUBLIC
    USING (current_user_has_access_to_tenant(tenant));

ALTER TABLE tenant_entity
    ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_tenant_info(tenant_id ltree)
    RETURNS json
AS
$$
BEGIN
    RETURN (SELECT json_build_object(
                           'id', t.id,
                           'name', t.name,
                           'models', (COALESCE((SELECT json_agg(m.definition)
                                                FROM model m
                                                WHERE m.tenant = t.id), '[]')),
                           'entities', (COALESCE((SELECT json_agg(te.definition)
                                                  FROM tenant_entity te
                                                  WHERE te.tenant = t.id), '[]')),
                           'events', (COALESCE((SELECT json_agg(me.definition)
                                                FROM model_event me
                                                WHERE me.tenant = t.id), '[]'))
                       )
            FROM tenant t
            WHERE t.id = tenant_id
            GROUP BY t.id);
END;
$$ LANGUAGE plpgsql;
