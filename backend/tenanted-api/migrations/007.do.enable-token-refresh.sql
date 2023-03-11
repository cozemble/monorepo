ALTER TABLE refresh_token
    ADD used BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION trade_refresh_token_for_user(given_refresh_token text)
    RETURNS json AS
$$
DECLARE
    user_data json;
BEGIN
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
    INTO user_data
    FROM refresh_token rt
             JOIN users u ON u.id = rt.user_id AND u.user_pool = rt.user_pool
             JOIN user_tenancy ut ON u.id = ut.user_id
             JOIN tenant t ON t.id = ut.tenant
    WHERE rt.refresh_token = given_refresh_token
      AND rt.used = FALSE
    GROUP BY u.id, u.first_name;

    UPDATE refresh_token SET used = TRUE WHERE refresh_token = given_refresh_token;

    RETURN user_data;
END;
$$ LANGUAGE plpgsql;

