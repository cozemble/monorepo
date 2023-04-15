CREATE OR REPLACE FUNCTION get_records(
    given_env text,
    given_tenant_id LTREE,
    given_model_id TEXT,
    given_q TEXT DEFAULT NULL,
    given_conditions JSONB DEFAULT '{}'::jsonb,
    given_limit INTEGER DEFAULT 10,
    given_offset INTEGER DEFAULT 0
)
    RETURNS JSONB AS
$$
DECLARE
    records      JSONB[];
    query_count  INTEGER;
    total_count  INTEGER;
    query_pages  INTEGER;
    total_pages  INTEGER;
    where_clause TEXT := '';
    key          TEXT;
    value        TEXT;
    query_str    TEXT;
BEGIN
    FOR key, value IN (SELECT * FROM jsonb_each_text(given_conditions))
        LOOP
            where_clause := where_clause || ' AND o.definition->''values''' || key || ' ' || value;
        END LOOP;

    query_str := FORMAT('
        SELECT ARRAY(
            SELECT DISTINCT ON (o.id) o.definition
            FROM record o
            LEFT JOIN record c ON c.id = ANY (o.record_references) AND c.tenant = o.tenant and c.env = o.env
            WHERE o.model_id = %L
                AND o.tenant = %L and o.env = %L'
                            || where_clause || ' ' ||
                        'AND (COALESCE(%L, '''') = '''' OR o.text ILIKE (''%%'' || %L || ''%%'') OR
                        c.text ILIKE (''%%'' || %L || ''%%''))
                    ORDER BY o.id, o.created_at DESC
                    LIMIT %s OFFSET %s)',
                        given_model_id, given_tenant_id, given_env, given_q, given_q, given_q, given_limit, given_offset
        );

    EXECUTE query_str INTO records;

    EXECUTE FORMAT('
        SELECT COUNT(DISTINCT o.id) AS query_count
        FROM record o
        LEFT JOIN record c ON c.id = ANY (o.record_references) AND c.tenant = o.tenant
        WHERE o.model_id = %L
            AND o.tenant = %L  and o.env = %L'
                       || where_clause || ' ' ||
                   'AND (COALESCE(%L, '''') = '''' OR o.text ILIKE (''%%'' || %L || ''%%'') OR c.text ILIKE (''%%'' || %L || ''%%''))',
                   given_model_id, given_tenant_id, given_env, given_q, given_q, given_q
        ) INTO query_count;

    SELECT COUNT(*) AS tc
    INTO total_count
    FROM record
    WHERE model_id = given_model_id
      AND tenant = given_tenant_id
      and env = given_env;

    query_pages := CEIL(query_count::FLOAT / given_limit);
    query_pages := GREATEST(query_pages, 1);
    total_pages := CEIL(total_count::FLOAT / given_limit);
    total_pages := GREATEST(total_pages, 1);

    RETURN jsonb_build_object(
            'queryCount', query_count,
            'queryPages', query_pages,
            'totalCount', total_count,
            'totalPages', total_pages,
            'records', records
        );
END;
$$ LANGUAGE plpgsql;
