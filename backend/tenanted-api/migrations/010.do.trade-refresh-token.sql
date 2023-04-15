CREATE OR REPLACE FUNCTION  trade_refresh_token_for_user(given_env text, given_refresh_token text)
    RETURNS json AS
$$
DECLARE
    user_data           json;
    selected_refresh_token record;
    sub_value           text;
BEGIN

    SELECT * INTO selected_refresh_token
    FROM refresh_token
    WHERE refresh_token = given_refresh_token
      AND used = FALSE and env = given_env;

    IF NOT FOUND THEN
        RETURN NULL; -- return NULL if no valid token was found
    END IF;

    UPDATE refresh_token SET used = TRUE WHERE refresh_token = given_refresh_token and env = given_env;

    SELECT user_id INTO sub_value FROM refresh_token WHERE refresh_token = given_refresh_token  and env = given_env;
    EXECUTE 'SET LOCAL jwt.claim.sub = ' || quote_literal(sub_value);

    user_data := get_user_json(given_env,selected_refresh_token.user_id, selected_refresh_token.user_pool);
    -- if user data is null
    IF user_data IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN user_data;
END;
$$ LANGUAGE plpgsql