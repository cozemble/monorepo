create table prompt_event
(
    id                 serial primary key,
    prompt_type        varchar(16)  not null,
    user_prompt_text   text         not null,
    response_text      text,
    prompt_template_id varchar(128) not null,
    error              text,
    submit_timestamp   bigint       not null,
    response_timestamp bigint       not null,
    request_time_mills bigint       not null,
    session_id         uuid         not null
);

CREATE OR REPLACE FUNCTION insert_prompt_event(
    _prompt_type VARCHAR,
    _user_prompt_text TEXT,
    _response_text TEXT,
    _prompt_template_id VARCHAR,
    _error TEXT,
    _submit_timestamp BIGINT,
    _response_timestamp BIGINT,
    _session_id UUID
)
    RETURNS VOID AS
$$
BEGIN
    INSERT INTO prompt_event(
        prompt_type,
        user_prompt_text,
        response_text,
        prompt_template_id,
        error,
        submit_timestamp,
        response_timestamp,
        session_id,
        request_time_mills
    )
    VALUES (
               _prompt_type,
               _user_prompt_text,
               _response_text,
               _prompt_template_id,
               _error,
               _submit_timestamp,
               _response_timestamp,
               _session_id,
               _response_timestamp - _submit_timestamp
           );
END;
$$ LANGUAGE plpgsql;
