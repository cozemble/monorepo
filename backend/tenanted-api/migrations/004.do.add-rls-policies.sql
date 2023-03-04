
-- Allow anyone to INSERT into the tenant table
CREATE POLICY tenant_insert_policy
    ON tenant
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

-- Restrict access to SELECT operations on the tenant table based on the user_tenancy table
CREATE POLICY tenant_select_policy
    ON tenant
    FOR SELECT
    TO PUBLIC
    USING (id <@ ANY (SELECT tenant
                      FROM user_tenancy
                      WHERE user_id = current_setting('jwt.claim.sub')));

-- Restrict access to UPDATE operations on the tenant table  based on the user_tenancy table
CREATE POLICY tenant_update_policy
    ON tenant
    FOR UPDATE
    TO PUBLIC
    USING (id <@ ANY (SELECT tenant
                      FROM user_tenancy
                      WHERE user_id = current_setting('jwt.claim.sub')));

-- Restrict access to DELETE operations on the tenant table  based on the user_tenancy table
CREATE POLICY tenant_delete_policy
    ON tenant
    FOR DELETE
    TO PUBLIC
    USING (id <@ ANY (SELECT tenant
                      FROM user_tenancy
                      WHERE user_id = current_setting('jwt.claim.sub')));

ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;

CREATE POLICY model_insert_policy
    ON model
    FOR INSERT
    WITH CHECK (tenant <@ ANY (SELECT tenant
                              FROM user_tenancy
                              WHERE user_id = current_setting('jwt.claim.sub')));

CREATE POLICY model_select_policy
    ON model
    FOR SELECT
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                             FROM user_tenancy
                             WHERE user_id = current_setting('jwt.claim.sub')));

CREATE POLICY model_update_policy
    ON model
    FOR UPDATE
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                          FROM user_tenancy
                          WHERE user_id = current_setting('jwt.claim.sub')));

CREATE POLICY model_delete_policy
    ON model
    FOR DELETE
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                          FROM user_tenancy
                          WHERE user_id = current_setting('jwt.claim.sub')));

ALTER TABLE model ENABLE ROW LEVEL SECURITY;

CREATE POLICY model_event_insert_policy
    ON model_event
    FOR INSERT
    WITH CHECK (tenant <@ ANY (SELECT tenant
                               FROM user_tenancy
                               WHERE user_id = current_setting('jwt.claim.sub')));

CREATE POLICY model_event_select_policy
    ON model_event
    FOR SELECT
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                          FROM user_tenancy
                          WHERE user_id = current_setting('jwt.claim.sub')));

CREATE POLICY model_event_update_policy
    ON model_event
    FOR UPDATE
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                          FROM user_tenancy
                          WHERE user_id = current_setting('jwt.claim.sub')));

CREATE POLICY model_event_delete_policy
    ON model_event
    FOR DELETE
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                          FROM user_tenancy
                          WHERE user_id = current_setting('jwt.claim.sub')));

ALTER TABLE model_event ENABLE ROW LEVEL SECURITY;

CREATE POLICY record_insert_policy
    ON record
    FOR INSERT
    WITH CHECK (tenant <@ ANY (SELECT tenant
                               FROM user_tenancy
                               WHERE user_id = current_setting('jwt.claim.sub')));

CREATE POLICY record_select_policy
    ON record
    FOR SELECT
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                          FROM user_tenancy
                          WHERE user_id = current_setting('jwt.claim.sub')));

CREATE POLICY record_update_policy
    ON record
    FOR UPDATE
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                          FROM user_tenancy
                          WHERE user_id = current_setting('jwt.claim.sub')));

CREATE POLICY record_delete_policy
    ON record
    FOR DELETE
    TO PUBLIC
    USING (tenant <@ ANY (SELECT tenant
                          FROM user_tenancy
                          WHERE user_id = current_setting('jwt.claim.sub')));

ALTER TABLE record ENABLE ROW LEVEL SECURITY;
