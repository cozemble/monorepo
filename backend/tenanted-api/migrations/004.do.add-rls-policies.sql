
-- Allow anyone to INSERT into the tenant table
CREATE POLICY tenant_insert_policy
    ON tenant
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

-- Restrict access to SELECT operations based on the user_tenancy table
CREATE POLICY tenant_select_policy
    ON tenant
    FOR SELECT
    TO PUBLIC
    USING (id <@ ANY (SELECT tenant
                      FROM user_tenancy
                      WHERE user_id = current_setting('jwt.claim.sub')));

-- Restrict access to UPDATE operations based on the user_tenancy table
CREATE POLICY tenant_update_policy
    ON tenant
    FOR UPDATE
    TO PUBLIC
    USING (id <@ ANY (SELECT tenant
                      FROM user_tenancy
                      WHERE user_id = current_setting('jwt.claim.sub')));

-- Restrict access to DELETE operations based on the user_tenancy table
CREATE POLICY tenant_delete_policy
    ON tenant
    FOR DELETE
    TO PUBLIC
    USING (id <@ ANY (SELECT tenant
                      FROM user_tenancy
                      WHERE user_id = current_setting('jwt.claim.sub')));

ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;