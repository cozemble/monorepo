CREATE OR REPLACE FUNCTION extract_referenced_records(json_data JSONB)
    RETURNS TEXT[] AS
$$
DECLARE
    refs         TEXT[] := '{}';
    current_data JSONB;
    queue        JSONB[] := ARRAY [json_data];
    key          TEXT;
BEGIN
    WHILE array_length(queue, 1) > 0
        LOOP
            current_data := queue[1];
            queue := array_remove(queue, current_data);

            IF jsonb_typeof(current_data) = 'object' THEN
                IF jsonb_typeof(current_data -> 'referencedRecordId' -> 'value') = 'string' THEN
                    refs := array_append(refs, (current_data -> 'referencedRecordId' ->> 'value'));
                END IF;

                FOR key IN SELECT jsonb_object_keys(current_data)
                    LOOP
                        queue := array_append(queue, current_data -> key);
                    END LOOP;
            ELSIF jsonb_typeof(current_data) = 'array' THEN
                FOR i IN 0..jsonb_array_length(current_data) - 1
                    LOOP
                        queue := array_append(queue, current_data -> i);
                    END LOOP;
            END IF;
        END LOOP;

    -- Remove duplicates from the array and return
    SELECT ARRAY(SELECT DISTINCT unnest(refs)) INTO refs;
    RETURN refs;
END;
$$ LANGUAGE plpgsql;

-- alter records table to add an array of text as column references, if not exists
ALTER TABLE record ADD COLUMN record_references TEXT[] default '{}'::TEXT[];

CREATE OR REPLACE FUNCTION update_record_references_column()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.record_references := extract_referenced_records(NEW.definition);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_record_references_trigger
    BEFORE INSERT OR UPDATE
    ON record
    FOR EACH ROW
EXECUTE FUNCTION update_record_references_column();


