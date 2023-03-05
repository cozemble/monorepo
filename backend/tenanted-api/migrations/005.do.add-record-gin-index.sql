CREATE INDEX record_definition_gin_en ON record
    USING gin (to_tsvector('english', definition));
