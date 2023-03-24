CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table if not exists objects
(
    id               uuid      NOT NULL DEFAULT uuid_generate_v4(),
    tenant           ltree     not null,
    name             text      not null,
    size_in_bytes    bigint    NOT NULL,
    mime_type        text      not null,
    storage_provider text      not null,
    storage_details  jsonb     not null,
    metadata         jsonb     not null,
    created_at       timestamp not null default now(),
    updated_at       timestamp not null default now(),
    primary key (id, tenant)
);

CREATE POLICY objects_insert_policy
    ON objects
    FOR INSERT
    WITH CHECK (tenant <@ ANY (SELECT tenant
                               FROM user_tenancy
                               WHERE user_id = get_jwt_claim_sub()));

CREATE POLICY objects_select_policy
    ON objects
    FOR SELECT
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                          FROM user_tenancy
                          WHERE user_id = get_jwt_claim_sub()));

CREATE POLICY objects_update_policy
    ON objects
    FOR UPDATE
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                          FROM user_tenancy
                          WHERE user_id = get_jwt_claim_sub()));

CREATE POLICY objects_delete_policy
    ON objects
    FOR DELETE
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                          FROM user_tenancy
                          WHERE user_id = get_jwt_claim_sub()));

ALTER TABLE objects
    ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION create_object(
    p_id uuid,
    p_tenant ltree,
    p_name text,
    p_size_in_bytes bigint,
    p_mime_type text,
    p_storage_provider text,
    p_storage_details jsonb,
    p_metadata jsonb
)
    RETURNS json
    LANGUAGE plpgsql
AS
$$
DECLARE
    v_object_json json;
BEGIN
    INSERT INTO objects (id,
                         tenant,
                         name,
                         size_in_bytes,
                         mime_type,
                         storage_provider,
                         storage_details,
                         metadata)
    VALUES (p_id,
            p_tenant,
            p_name,
            p_size_in_bytes,
            p_mime_type,
            p_storage_provider,
            p_storage_details,
            p_metadata);

    -- Call get_object_as_json with the provided id and tenant
    SELECT get_object_as_json(p_id, p_tenant) INTO v_object_json;

    RETURN v_object_json;
END;
$$;


CREATE OR REPLACE FUNCTION get_object_as_json(p_id uuid, p_tenant ltree)
    RETURNS json
    LANGUAGE plpgsql
AS
$$
DECLARE
    v_object_json json;
BEGIN
    SELECT json_build_object(
                   'id', id,
                   'tenant', tenant,
                   'name', name,
                   'size_in_bytes', size_in_bytes,
                   'mime_type', mime_type,
                   'storage_provider', storage_provider,
                   'storage_details', storage_details,
                   'metadata', metadata,
                   'created_at', created_at,
                   'updated_at', updated_at
               )
    INTO v_object_json
    FROM objects
    WHERE id = p_id
      AND tenant = p_tenant;

    RETURN v_object_json;
END;
$$;
