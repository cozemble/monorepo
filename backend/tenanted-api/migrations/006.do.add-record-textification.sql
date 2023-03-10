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
                FOR i IN 0 .. jsonb_array_length(v)
                    LOOP
                        RETURN QUERY SELECT * FROM get_jsonb_each(v[i], current_path || '[' || i || ']');
                    END LOOP;
            ELSE
                return query select k, v, current_path;
            END IF;
        END LOOP;
END;
$$ LANGUAGE plpgsql;

-- return all the keys and values in a jsonb object that are uuids
CREATE OR REPLACE FUNCTION values_keyed_by_uuid(jsonb_data jsonb)
    RETURNS TABLE
            (
                key   text,
                value jsonb,
                path   text
            )
AS
$$
BEGIN
    RETURN QUERY SELECT key, value, path
                 FROM get_jsonb_each(jsonb_data)
                 WHERE key ~* '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$';
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
    WHERE get_jsonb_each.key ~* '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$';

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

