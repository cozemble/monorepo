CREATE OR REPLACE FUNCTION get_records(
    given_tenant_id LTREE,
    given_model_id TEXT,
    given_q TEXT DEFAULT NULL,
    given_limit INTEGER DEFAULT 10,
    given_offset INTEGER DEFAULT 0
)
    RETURNS JSONB AS
$$
DECLARE
    records     JSONB[];
    query_count INTEGER;
    total_count INTEGER;
    query_pages INTEGER;
    total_pages INTEGER;
BEGIN
    SELECT ARRAY(
                   SELECT DISTINCT ON (o.id) o.definition
                   FROM record o
                            LEFT JOIN record c ON c.id = ANY (o.record_references) AND c.tenant = o.tenant
                   WHERE o.model_id = given_model_id
                     AND o.tenant = given_tenant_id
                     AND (given_q IS NULL OR o.text ILIKE ('%' || given_q || '%') OR
                          c.text ILIKE ('%' || given_q || '%'))
                   ORDER BY o.id, o.created_at DESC
                   LIMIT given_limit OFFSET given_offset
               )
    INTO records;

    SELECT COUNT(DISTINCT o.id) AS query_count
    INTO query_count
    FROM record o
             LEFT JOIN record c ON c.id = ANY (o.record_references) AND c.tenant = o.tenant
    WHERE o.model_id = given_model_id
      AND o.tenant = given_tenant_id
      AND (given_q IS NULL OR o.text ILIKE ('%' || given_q || '%') OR c.text ILIKE ('%' || given_q || '%'));

    SELECT COUNT(*) AS tc
    INTO total_count
    FROM record
    WHERE model_id = given_model_id
      AND tenant = given_tenant_id;

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
