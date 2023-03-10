CREATE TABLE messages (
                          id SERIAL PRIMARY KEY,
                          correlation_id TEXT NULL,
                          level TEXT NOT NULL,
                          message TEXT NOT NULL,
                          jwt_sub_claim TEXT NOT NULL,
                          created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION get_correlation_id()
    RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(current_setting('app.correlation.id', true), NULL);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_message(
    p_level TEXT,
    p_message TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO messages (correlation_id, level, message, jwt_sub_claim)
    VALUES (get_correlation_id(), p_level, p_message, get_jwt_claim_sub());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_messages_since(
    p_since TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '1 HOUR'
) RETURNS JSON AS $$
DECLARE
    messages_json JSON;
BEGIN
    SELECT json_agg(t) INTO messages_json
    FROM (
             SELECT correlation_id, level, message, jwt_sub_claim, created_at
             FROM messages
             WHERE created_at >= p_since
         ) t;

    RETURN messages_json;
END;
$$ LANGUAGE plpgsql;

create table authorization_token
(
    token     text primary key,
    user_id   text   not null,
    user_pool ltree  not null,
    iat       bigint not null,
    exp       bigint not null,
    used      boolean default false,
    foreign key (user_id, user_pool) references users (id, user_pool)
);

CREATE OR REPLACE FUNCTION insert_auth_token(user_id text, user_pool ltree)
    RETURNS text AS
$$
DECLARE
    new_token text;
    iat       bigint;
    exp       bigint;
BEGIN
    new_token := md5(random()::text || clock_timestamp()::text)::uuid::text; -- generate a random token
    iat := (extract(epoch FROM now()) * 1000)::bigint; -- get current time in epoch milliseconds
    exp := iat + (10 * 60 * 1000); -- set expiration time to 10 minutes from issued time

    INSERT INTO authorization_token (token, user_id, user_pool, iat, exp)
    VALUES (new_token, user_id, user_pool, iat, exp);

    RETURN new_token;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_json(given_user_id text, given_user_pool ltree)
    RETURNS json AS
$$
BEGIN
    RETURN (
        SELECT json_build_object(
                       'user_id', u.id,
                       'first_name', u.first_name,
                       'user_pool', u.user_pool,
                       'tenants', json_agg(json_build_object(
                        'tenant_name', t.name,
                        'tenant_id', t.id,
                        'roles', ut.roles
                    ))
                   )
        FROM users u
                 JOIN user_tenancy ut ON u.id = ut.user_id
                 JOIN tenant t ON t.id = ut.tenant
        WHERE u.id = given_user_id
          AND u.user_pool = given_user_pool
        GROUP BY u.id, u.first_name, u.email, u.user_pool
    );
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION trade_auth_token_for_user(given_auth_token text)
    RETURNS json AS
$$
DECLARE
    user_data           json;
    current_time_ms     bigint;
    selected_auth_token record;
    sub_value           text;
BEGIN
    PERFORM insert_message('INFO', 'Trading auth token for user - token is ' || given_auth_token);
    current_time_ms := (extract(epoch FROM now()) * 1000)::bigint; -- get current time in epoch milliseconds

    SELECT * INTO selected_auth_token
    FROM authorization_token
    WHERE token = given_auth_token
      AND used = FALSE
      AND exp > current_time_ms; -- only include tokens that expire after the current time

    IF NOT FOUND THEN
        PERFORM insert_message('INFO', 'Authorization token not found or expired');
        RETURN NULL; -- return NULL if no valid token was found
    END IF;
    PERFORM insert_message('INFO', 'Found authorization token');

    UPDATE authorization_token SET used = TRUE WHERE token = given_auth_token;

    SELECT user_id INTO sub_value FROM authorization_token WHERE token = given_auth_token;
    PERFORM insert_message('INFO', 'Setting sub claim to ' || sub_value);
    EXECUTE 'SET LOCAL jwt.claim.sub = ' || quote_literal(sub_value);

    user_data := get_user_json(selected_auth_token.user_id, selected_auth_token.user_pool);
    -- if user data is null
    IF user_data IS NULL THEN
        PERFORM insert_message('INFO', 'User data not found');
        RETURN NULL;
    END IF;
    PERFORM insert_message('INFO', 'Found user data' );

    RETURN user_data;
END;
$$ LANGUAGE plpgsql;

