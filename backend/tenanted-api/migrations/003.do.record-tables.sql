create table if not exists record
(
    id         text      not null,
    tenant     ltree     not null,
    model_id   text      not null,
    definition jsonb     not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    primary key (id, model_id, tenant)
);

create index if not exists record_tenant_idx on record using gist (tenant);

create index if not exists record_model_id_idx on record (model_id);

-- should refer to the model table via foreign key
alter table record
    add constraint record_model_id_fkey
        foreign key (model_id, tenant)
            references model (id, tenant)
            on delete cascade;

-- add a column called text to the record table
ALTER TABLE record ADD COLUMN text text;


CREATE OR REPLACE FUNCTION get_records(
    given_tenant_id LTREE,
    given_model_id TEXT,
    given_q TEXT DEFAULT NULL,
    given_limit INTEGER DEFAULT 10,
    given_offset INTEGER DEFAULT 0
)
    RETURNS JSONB AS
$$
DECLARE
    records     JSONB[];
    query_count INTEGER;
    total_count INTEGER;
    query_pages INTEGER;
    total_pages INTEGER;
BEGIN
    IF given_q IS NOT NULL THEN
        SELECT ARRAY(
                       SELECT definition
                       FROM record
                       WHERE model_id = given_model_id
                         AND tenant = given_tenant_id
                         AND to_tsvector('english', text) @@ to_tsquery('english', given_q)
                       ORDER BY created_at DESC
                       LIMIT given_limit OFFSET given_offset
                   )
        INTO records;

        SELECT COUNT(*) AS query_count
        INTO query_count
        FROM record
        WHERE model_id = given_model_id
          AND tenant = given_tenant_id
          AND to_tsvector('english', text) @@ to_tsquery('english', given_q);
    ELSE
        SELECT ARRAY(
                       SELECT definition
                       FROM record
                       WHERE model_id = given_model_id
                         AND tenant = given_tenant_id
                       ORDER BY created_at DESC
                       LIMIT given_limit OFFSET given_offset
                   )
        INTO records;

        SELECT COUNT(*) AS query_count
        INTO query_count
        FROM record
        WHERE model_id = given_model_id
          AND tenant = given_tenant_id;
    END IF;

    SELECT COUNT(*) AS tc
    INTO total_count
    FROM record
    WHERE model_id = given_model_id
      AND tenant = given_tenant_id;


    query_pages := CEIL(query_count::FLOAT / given_limit);
    query_pages := GREATEST(query_pages, 1);
    total_pages := CEIL(total_count::FLOAT / given_limit);
    total_pages := GREATEST(total_pages, 1);

    RETURN jsonb_build_object(
            'queryCount', query_count,
            'queryPages', query_pages,
            'totalCount', total_count,
            'totalPages', total_pages,
            'records', records
        );
END;
$$ LANGUAGE plpgsql
;

CREATE OR REPLACE FUNCTION upsert_record(p_tenant LTREE, p_definition JSONB)
    RETURNS VOID AS
$$
DECLARE
    p_id       TEXT;
    p_model_id TEXT;
    record_obj JSONB;
BEGIN
    -- Loop through the p_definition array and insert or update each record
    FOR record_obj IN SELECT jsonb_array_elements(p_definition)
        LOOP
            -- Extract p_id and p_model_id from the current record object
            p_id := (record_obj ->> 'id')::jsonb ->> 'value';
            p_model_id := (record_obj ->> 'modelId')::jsonb ->> 'value';

            -- Update the record if it already exists
            UPDATE record
            SET definition = record_obj,
                updated_at = NOW()
            WHERE id = p_id
              AND model_id = p_model_id
              AND tenant = p_tenant;

            -- If the record does not exist, insert a new one
            IF NOT FOUND THEN
                INSERT INTO record (id, tenant, model_id, definition)
                VALUES (p_id, p_tenant, p_model_id, record_obj);
            END IF;
        END LOOP;
END;
$$ LANGUAGE plpgsql;
;


