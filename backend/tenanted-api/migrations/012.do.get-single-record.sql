CREATE OR REPLACE FUNCTION get_record(
    given_env text,
    p_tenant ltree,
    p_model_id text,
    p_record_id text
)
    RETURNS jsonb AS
$$
DECLARE
    v_definition jsonb;
BEGIN
    SELECT r.definition
    INTO v_definition
    FROM record r
    WHERE r.tenant = p_tenant
      AND r.env = given_env
      AND r.model_id = p_model_id
      AND r.id = p_record_id;

    RETURN v_definition;
END;
$$ LANGUAGE plpgsql;