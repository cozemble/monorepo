create table if not exists record
(
    env        text      not null,
    id         text      not null,
    seq_id     bigint    not null,
    tenant     ltree     not null,
    model_id   text      not null,
    definition jsonb     not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    primary key (env, id, model_id, tenant)
);

create index record_tenant_idx on record using gist (tenant);

create index record_model_id_idx on record (model_id);
create index record_model_env_idx on record (env);

-- should refer to the model table via foreign key
alter table record
    add constraint record_model_id_fkey
        foreign key (env, model_id, tenant)
            references model (env, id, tenant)
            on delete cascade;

-- add a column called text to the record table
ALTER TABLE record
    ADD COLUMN text text;


CREATE OR REPLACE FUNCTION upsert_record(given_env text, p_tenant LTREE, p_definition JSONB)
    RETURNS JSONB AS
$$
DECLARE
    p_id                  TEXT;
    p_model_id            TEXT;
    record_obj            JSONB;
    unique_paths_arr      TEXT[];
    path                  TEXT;
    unique_value_exists   BOOLEAN;
    current_path_value    JSONB;
    conflicting_record_id TEXT;
    seq_name              text;
    seq_id                bigint;
    inserted_records      JSONB[] := '{}'; -- Array to store inserted records
    updated_records       JSONB[] := '{}'; -- Array to store updated records
    tmp_record            JSONB; -- Temporary variable to store a single inserted or updated record
BEGIN
    -- Loop through the p_definition array and insert or update each record
    FOR record_obj IN SELECT jsonb_array_elements(p_definition)
        LOOP
            -- Extract p_id and p_model_id from the current record object
            p_id := (record_obj ->> 'id')::jsonb ->> 'value';
            p_model_id := (record_obj ->> 'modelId')::jsonb ->> 'value';

            -- Retrieve unique_paths from the associated model
            SELECT unique_paths
            INTO unique_paths_arr
            FROM model
            WHERE id = p_model_id
              AND tenant = p_tenant;

            -- Initialize unique_value_exists to FALSE
            unique_value_exists := FALSE;

            -- Check each unique_path to see if it exists in another record
            FOREACH path IN ARRAY unique_paths_arr
                LOOP
                    -- Create the JSONB object for the current path
                    current_path_value :=
                            jsonb_build_object(path, (record_obj -> 'values') #> string_to_array(path, '.'));
                    -- Acquire an advisory lock based on the hash of the path and current_path_value
                    PERFORM pg_advisory_xact_lock(abs(hashtext(path || current_path_value::text))::bigint);

                    SELECT EXISTS (SELECT 1
                                   FROM record
                                   WHERE tenant = p_tenant
                                     AND env = given_env
                                     AND model_id = p_model_id
                                     AND (definition -> 'values') @> current_path_value
                                     AND id != p_id)
                    INTO unique_value_exists;

                    -- If a unique value is found, exit the loop
                    IF unique_value_exists THEN
                        SELECT id
                        INTO conflicting_record_id
                        FROM record
                        WHERE tenant = p_tenant
                          AND env = given_env
                          AND model_id = p_model_id
                          AND (definition -> 'values') @> current_path_value
                          AND id != p_id;
                        EXIT;
                    END IF;
                END LOOP;

            IF NOT unique_value_exists THEN
                -- Update the record if it already exists
                WITH updated AS (
                    UPDATE record
                        SET definition = record_obj,
                            updated_at = NOW()
                        WHERE id = p_id
                            AND model_id = p_model_id
                            AND tenant = p_tenant
                        RETURNING definition)
                SELECT definition
                FROM updated
                INTO tmp_record;
                IF tmp_record IS NOT NULL THEN
                    updated_records := array_append(updated_records, tmp_record);
                END IF;

                -- If the record does not exist, insert a new one
                IF NOT FOUND THEN
                    -- Look up the sequence name in the sequence_name_mapping table
                    SELECT sequence_name
                    INTO seq_name
                    FROM sequence_name_mapping
                    WHERE env = given_env
                      AND tenant_id = p_tenant
                      AND model_id = p_model_id;

                    -- Get the next value from the sequence
                    seq_id := nextval(seq_name)::text;

                    -- Update the definition with the sequential ID
                    record_obj = jsonb_set(record_obj, '{seqId}', to_jsonb(seq_id));

                    WITH inserted AS (
                        INSERT INTO record (env, id, seq_id, tenant, model_id, definition)
                            VALUES (given_env, p_id, seq_id, p_tenant, p_model_id, record_obj)
                            RETURNING definition)
                    SELECT definition
                    FROM inserted
                    INTO tmp_record;
                    IF tmp_record IS NOT NULL THEN
                        inserted_records := array_append(inserted_records, tmp_record);
                    END IF;
                END IF;
            ELSE
                RETURN jsonb_build_object(
                        '_type', 'error.conflict', 'conflictingRecordId', conflicting_record_id, 'conflictingModelId',
                        p_model_id,
                        'conflictingPath',
                        path);
            END IF;
        END LOOP;

    RETURN jsonb_build_object('_type', 'success', 'insertedRecords', inserted_records, 'updatedRecords',
                              updated_records);
END;
$$ LANGUAGE plpgsql;






