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
BEGIN
    current_time_ms := (extract(epoch FROM now()) * 1000)::bigint; -- get current time in epoch milliseconds

    SELECT * INTO selected_auth_token
    FROM authorization_token
    WHERE token = given_auth_token
      AND used = FALSE
      AND exp > current_time_ms; -- only include tokens that expire after the current time

    IF NOT FOUND THEN
        RETURN NULL; -- return NULL if no valid token was found
    END IF;

    UPDATE authorization_token SET used = TRUE WHERE token = given_auth_token;

    user_data := get_user_json(selected_auth_token.user_id, selected_auth_token.user_pool);

    RETURN user_data;
END;
$$ LANGUAGE plpgsql;

