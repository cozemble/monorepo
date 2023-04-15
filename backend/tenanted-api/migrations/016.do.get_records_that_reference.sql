CREATE OR REPLACE FUNCTION get_records_that_reference(
    given_env text,
    p_tenant ltree,
    p_model_id text,
    p_target_record_id text
)
    RETURNS jsonb AS
$$
DECLARE
    result jsonb;
BEGIN
    SELECT COALESCE(jsonb_agg(definition), '[]'::jsonb)
    FROM public.record
    WHERE tenant = p_tenant
      AND env = given_env
      AND model_id = p_model_id
      AND p_target_record_id = ANY (record_references)
    INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;
