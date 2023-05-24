CREATE TABLE record_edges
(
    env                 text      not null,
    id                  text      not null,
    tenant              ltree     not null,
    model_reference_id  text      not null,
    origin_model_id     text      not null,
    reference_model_id  text      not null,
    origin_record_id    text      not null,
    reference_record_id text      not null,
    definition          jsonb     not null,
    created_at          timestamp not null default now(),
    updated_at          timestamp not null default now(),
    primary key (env, id, tenant)
);

ALTER TABLE record_edges
    ADD FOREIGN KEY (env, origin_model_id, origin_record_id, tenant) REFERENCES record (env, model_id, id, tenant);

ALTER TABLE record_edges
    ADD FOREIGN KEY (env, reference_model_id, reference_record_id, tenant) REFERENCES record (env, model_id, id, tenant);

CREATE INDEX idx_record_edges_origin_record_id ON record_edges (origin_model_id);

CREATE INDEX idx_record_edges_reference_record_id ON record_edges (reference_record_id);

CREATE INDEX idx_gist_tenant_record_edges ON record_edges USING gist (tenant);

CREATE OR REPLACE FUNCTION insert_record_edges(env text, tenant ltree, edges JSONB[])
    RETURNS VOID AS
$$
DECLARE
    edge JSONB;
BEGIN
    FOREACH edge IN ARRAY edges
        LOOP
            INSERT INTO record_edges
            (env,
             id,
             tenant,
             model_reference_id,
             origin_model_id,
             reference_model_id,
             origin_record_id,
             reference_record_id,
             definition)
            VALUES (env,
                    edge -> 'id' ->> 'value',
                    tenant,
                    edge -> 'modelReferenceId' ->> 'value',
                    edge -> 'originModelId' ->> 'value',
                    edge -> 'referenceModelId' ->> 'value',
                    edge -> 'originRecordId' ->> 'value',
                    edge -> 'referenceRecordId' ->> 'value',
                    edge);
        END LOOP;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_record(
    given_env text,
    p_tenant ltree,
    p_model_id text,
    p_record_id text
)
    RETURNS jsonb AS
$$
DECLARE
    v_record jsonb;
    v_edges  jsonb;
BEGIN
    SELECT r.definition
    INTO v_record
    FROM record r
    WHERE r.tenant = p_tenant
      AND r.env = given_env
      AND r.model_id = p_model_id
      AND r.id = p_record_id;

    SELECT coalesce(json_agg(e.definition), '[]'::json)
    INTO v_edges
    FROM record_edges e
    WHERE e.tenant = p_tenant
      AND e.env = given_env
      AND ((e.origin_model_id = p_model_id AND e.origin_record_id = p_record_id)
        OR (e.reference_model_id = p_model_id AND e.reference_record_id = p_record_id));

    RETURN jsonb_build_object('_type', 'record.and.edges', 'record', v_record, 'edges', v_edges);
END ;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION upsert_record_edges(given_env text, p_tenant LTREE, p_edges JSONB)
    RETURNS JSONB AS
$$
DECLARE
    edge_obj              JSONB;
    p_id                  TEXT;
    p_model_reference_id  TEXT;
    p_origin_model_id     TEXT;
    p_reference_model_id  TEXT;
    p_origin_record_id    TEXT;
    p_reference_record_id TEXT;
    inserted_count        INTEGER := 0;
    updated_count         INTEGER := 0;
BEGIN
    -- Loop through the p_edges array and insert or update each record edge
    FOR edge_obj IN SELECT jsonb_array_elements(p_edges)
        LOOP
            -- Extract edge details from the current edge object
            p_id := (edge_obj ->> 'id')::jsonb ->> 'value';
            p_model_reference_id := (edge_obj ->> 'modelReferenceId')::jsonb ->> 'value';
            p_origin_model_id := (edge_obj ->> 'originModelId')::jsonb ->> 'value';
            p_reference_model_id := (edge_obj ->> 'referenceModelId')::jsonb ->> 'value';
            p_origin_record_id := (edge_obj ->> 'originRecordId')::jsonb ->> 'value';
            p_reference_record_id := (edge_obj ->> 'referenceRecordId')::jsonb ->> 'value';

            -- Update the record edge if it already exists
            UPDATE record_edges
            SET model_reference_id  = p_model_reference_id,
                origin_model_id     = p_origin_model_id,
                reference_model_id  = p_reference_model_id,
                origin_record_id    = p_origin_record_id,
                reference_record_id = p_reference_record_id,
                definition          = edge_obj,
                updated_at          = NOW()
            WHERE id = p_id
              AND tenant = p_tenant;

            -- If the record edge does not exist, insert a new one
            IF NOT FOUND THEN
                INSERT INTO record_edges (env, id, tenant, model_reference_id, origin_model_id, reference_model_id,
                                          origin_record_id, reference_record_id, definition)
                VALUES (given_env, p_id, p_tenant, p_model_reference_id, p_origin_model_id, p_reference_model_id,
                        p_origin_record_id, p_reference_record_id, edge_obj);
                inserted_count := inserted_count + 1;
            ELSE
                updated_count := updated_count + 1;
            END IF;
        END LOOP;

    RETURN jsonb_build_object('_type', 'success', 'insertedCount', inserted_count, 'updatedCount', updated_count);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION delete_edges(given_env text, p_tenant LTREE, deleted_edges JSONB)
    RETURNS JSONB AS
$$
DECLARE
    edge_ids text[];
BEGIN
    -- Extract the 'value' field from each element in the 'deletedEdges' array and convert to text array
    SELECT ARRAY_AGG(edge ->> 'value')
    INTO edge_ids
    FROM jsonb_array_elements(deleted_edges) AS edge;

    -- Delete the edges with the matching IDs
    DELETE FROM record_edges
    WHERE env = given_env
      AND tenant = p_tenant
      AND id = ANY(edge_ids);

    RETURN jsonb_build_object('edge_ids', edge_ids);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION upsert_records_and_edges(given_env text, p_tenant LTREE, p_definition JSONB)
    RETURNS JSONB AS
$$
DECLARE
    record_result JSONB;
    edges_result  JSONB;
    deleted_edges_result JSONB;
BEGIN
    -- Delete edges
    deleted_edges_result := delete_edges(given_env, p_tenant, p_definition -> 'deletedEdges');

    -- Upsert records
    SELECT upsert_record(given_env, p_tenant, p_definition -> 'records')
    INTO record_result;

    -- If there was a conflict while upserting records, return the error
    IF (record_result -> '_type')::text = '"error.conflict"' THEN
        RETURN record_result;
    END IF;

    -- Upsert record edges
    SELECT upsert_record_edges(given_env, p_tenant, p_definition -> 'edges')
    INTO edges_result;

    -- Return aggregated result
    RETURN jsonb_build_object(
            '_type', 'success',
            'recordResult', record_result,
            'edgesResult', edges_result,
            'deletedEdgesResult', deleted_edges_result
        );
END;
$$ LANGUAGE plpgsql;
