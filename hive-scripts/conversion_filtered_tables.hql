CREATE TABLE turn_action_filtered(
mp_ad_format_id         bigint,                                      
mp_advertiser_id        bigint,                                      
mp_advertiser_name      string,                                     
media_channel_id        bigint,                                      
city                    string,                                      
contextual_category_id  bigint,                                      
contextual_category_name    string,                                      
mp_creative_id          bigint,                                      
mp_creative_name        string,                                      
ext_app                 string,                                     
iab_category_name       string,                                      
impression_time         bigint,                                      
mp_insertion_order_id   bigint,                                      
mp_line_item_name       string,                                      
mp_line_item_id         bigint,                                      
device_type             string,                                      
postal_code             string,                                      
mp_publisher_id         bigint,                                      
beacon_id               bigint,                                      
user_id                 bigint,                                     
click                   bigint,                                      
click_time              bigint,                                      
action_time             bigint,                                     
action                  string,                                      
user_stability          string,                                      
count                   bigint,                                      
mp_package_name         string,                                      
mp_package_id           bigint
)         

PARTITIONED BY (dt string)
row format delimited fields terminated by ',' stored as textfile;




CREATE TABLE chango_conversion_filtered(
action_timestamp        int,                                         
exchange_id             string,                                      
chango_token            string,                                      
bid_id                  string,                                      
campaign_id             int,                                         
ad_id                   int,
account_id              int,   
tactic_id               int,
action                  string,                                                 
domain                  string,  
media_cost              decimal(10,0),                                     
creative_views          int,                                         
country                 string,                                      
region                  string,                                      
user_timezone           string,
ad_dimensions           string, 
ad_position             int,                                        
ip                      string,                                      
user_agent              string,                                      
partner_user_id         string,                                      
partner_secondary_user_id   string                                          
)      

PARTITIONED BY (dt string)
row format delimited fields terminated by ',' stored as textfile;