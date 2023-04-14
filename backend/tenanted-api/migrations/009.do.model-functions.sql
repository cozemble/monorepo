create function put_tenant_info(given_env text, tenant_id_var ltree, models_and_events json) returns void
    language plpgsql
as
$$
DECLARE
    model_id_var       text;
    model_event_id_var text;
    model_and_events   json;
    model_info         json;
    event_definition   json;
    i                  int;
    j                  int;
    unique_paths_var       text[];
BEGIN

    -- Loop over the models and insert them
    IF json_array_length(models_and_events) > 0 THEN
        FOR i IN 0 .. json_array_length(models_and_events) - 1
            LOOP
                -- Get the model object from the JSON array
                model_and_events := models_and_events -> i;
                model_info := model_and_events -> 'model';
                unique_paths_var := ARRAY(SELECT json_array_elements_text(model_and_events -> 'uniquePaths'));

                -- Get the model ID from the model object
                model_id_var := model_info -> 'id' ->> 'value';

                -- Check if the model exists
                IF EXISTS(SELECT 1 FROM model WHERE id = model_id_var and env = given_env) THEN
                    -- Update the model
                    UPDATE model SET name = model_info -> 'name' ->> 'value', definition = model_info, unique_paths = unique_paths_var, updated_at = NOW() WHERE id = model_id_var;
                ELSE
                    -- Insert the model
                    INSERT INTO model (env,id, name, definition, tenant, unique_paths)
                    VALUES (given_env,model_id_var, model_info -> 'name' ->> 'value', model_info,
                            tenant_id_var::ltree, unique_paths_var);
                END IF;
                delete from model_event me where me.model_id = model_id_var and me.env = given_env;

                -- Loop over the model events and insert them
                IF json_array_length(model_and_events -> 'events') > 0 THEN
                    FOR j IN 0 .. json_array_length(model_and_events -> 'events') - 1
                        LOOP
                            -- Get the model event object from the JSON array
                            event_definition := model_and_events -> 'events' -> j;
                            model_event_id_var := event_definition -> 'id' ->> 'value';

                            -- Insert the model event
                            INSERT INTO model_event (env,id, definition, model_id, tenant)
                            VALUES (given_env,model_event_id_var, event_definition, model_id_var,
                                    tenant_id_var::ltree);
                        END LOOP;
                END IF;
            END LOOP;
    END IF;
END ;
$$
;

CREATE OR REPLACE FUNCTION get_tenant_info(given_env text, tenant_id ltree)
    RETURNS json
AS
$$
BEGIN
    RETURN (SELECT json_build_object(
                           'id', t.id,
                           'name', t.name,
                           'models', (COALESCE((SELECT json_agg(m.definition)
                                                FROM model m
                                                WHERE m.tenant = t.id and m.env = t.env), '[]')),
                           'events', (COALESCE((SELECT json_agg(me.definition)
                                                FROM model_event me
                                                WHERE me.tenant = t.id and m.env = t.env), '[]'))
                       )
            FROM tenant t
            WHERE t.id = tenant_id
            AND t.env = given_env
            GROUP BY t.id);
END;
$$ LANGUAGE plpgsql;
;

