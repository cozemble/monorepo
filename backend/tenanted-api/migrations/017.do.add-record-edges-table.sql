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
             reference_record_id)
            VALUES (env,
                    edge -> 'id' ->> 'value',
                    tenant,
                    edge -> 'modelReferenceId' ->> 'value',
                    edge -> 'originModelId' ->> 'value',
                    edge -> 'referenceModelId' ->> 'value',
                    edge -> 'originRecordId' ->> 'value',
                    edge -> 'referenceRecordId' ->> 'value');
        END LOOP;
END;
$$ LANGUAGE plpgsql;
