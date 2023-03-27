CREATE OR REPLACE FUNCTION get_jsonb_each(jsonb_data jsonb, parent_path text DEFAULT '')
    RETURNS TABLE
            (
                key   text,
                value jsonb,
                path  text
            )
AS
$$
declare
    current_path text;
    k            text;
    v            jsonb;
    i            integer;
BEGIN
    FOR k, v IN SELECT * FROM jsonb_each(jsonb_data)
        LOOP
            current_path := parent_path || '.' || k;
            IF jsonb_typeof(v) = 'object' THEN
                RETURN QUERY SELECT * FROM get_jsonb_each(v, current_path);
            ELSEIF jsonb_typeof(v) = 'array' THEN
                FOR i IN 0 .. jsonb_array_length(v) - 1
                    LOOP
                        IF jsonb_typeof(v -> i) IN ('object', 'array') THEN
                            RETURN QUERY SELECT * FROM get_jsonb_each(v -> i, current_path || '[' || i || ']');
                        ELSE
                            RETURN QUERY SELECT k, v -> i, current_path || '[' || i || ']';
                        END IF;
                    END LOOP;
            ELSE
                return query select k, v, current_path;
            END IF;
        END LOOP;
END;
$$ LANGUAGE plpgsql;

-- returns a textification of a jsonb object
CREATE OR REPLACE FUNCTION textify_record(jsonb_data jsonb)
    RETURNS text
AS
$$
DECLARE
    lower_value text;
BEGIN
    SELECT string_agg(lower(CAST(get_jsonb_each.value AS text)), ' ') INTO lower_value
    FROM get_jsonb_each(jsonb_data) AS get_jsonb_each
    WHERE get_jsonb_each.path ~* '^.values.';

    RETURN lower_value;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_text_column()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.text := textify_record(NEW.definition);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_text_trigger
    BEFORE INSERT OR UPDATE
    ON record
    FOR EACH ROW
EXECUTE FUNCTION update_text_column();

