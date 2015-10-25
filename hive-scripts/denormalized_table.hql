CREATE EXTERNAL TABLE campaign_performance_insights_denormalized_table (
    event_time bigint,
    user_id string,
    campaign_id bigint,
    tactic_id bigint,
    line_item_id bigint,
    advertiser_id bigint,
    creative_id bigint,
    media_channel_id bigint,
    contextual_category_id bigint,
    exchange_id string,
    ad_id int,
    ad_dimensions string,
    domain string,
    cost double,
    user_agent string,
    country string,
    state string,
    city string,
    attr_day_of_week string,
    attr_time_of_day int,
    attr_last_click_event_time bigint,
    attr_last_click_domain string,
    attr_click_count int,
    attr_last_impression_event_time bigint,
    attr_last_impression_domain string,
    attr_impression_count int,
    attr_impression_cost double,
    attr_imp_to_conversion_lag bigint,
    attr_imp_to_conversion_lag_bucket string
)
PARTITIONED BY 
    (data_provider_id string, event_type string, dt string)

LOCATION '/tmp/denormalized_table_location';