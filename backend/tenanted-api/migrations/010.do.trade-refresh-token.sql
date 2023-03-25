CREATE OR REPLACE FUNCTION  trade_refresh_token_for_user(given_refresh_token text)
    RETURNS json AS
$$
DECLARE
    user_data           json;
    selected_refresh_token record;
    sub_value           text;
BEGIN
    PERFORM insert_message('INFO', 'Trading refresh token for user - token is ' || given_refresh_token);

    SELECT * INTO selected_refresh_token
    FROM refresh_token
    WHERE refresh_token = given_refresh_token
      AND used = FALSE;

    IF NOT FOUND THEN
        PERFORM insert_message('INFO', 'Refresh token not found or used');
        RETURN NULL; -- return NULL if no valid token was found
    END IF;
    PERFORM insert_message('INFO', 'Found Refresh token');

    UPDATE refresh_token SET used = TRUE WHERE refresh_token = given_refresh_token;

    SELECT user_id INTO sub_value FROM refresh_token WHERE refresh_token = given_refresh_token;
    PERFORM insert_message('INFO', 'Setting sub claim to ' || sub_value);
    EXECUTE 'SET LOCAL jwt.claim.sub = ' || quote_literal(sub_value);

    user_data := get_user_json(selected_refresh_token.user_id, selected_refresh_token.user_pool);
    -- if user data is null
    IF user_data IS NULL THEN
        PERFORM insert_message('INFO', 'User data not found');
        RETURN NULL;
    END IF;
    PERFORM insert_message('INFO', 'Found user data' );

    RETURN user_data;
END;
$$ LANGUAGE plpgsql