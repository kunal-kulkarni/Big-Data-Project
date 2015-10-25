#!/bin/bash

# get the properties
read_properties() {
  file="$1"
  while IFS="=" read -r key value; do
    case "$key" in
      '#'*) ;;
      *)
        eval "$key=\"$value\""
    esac
  done < "$file"
}

read_properties campaign_insights.properties


# Handle Turn Converions
if [ $1 == turn ]; then
hive -e "INSERT OVERWRITE LOCAL DIRECTORY '$dupes_csv_in_dir' ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' STORED AS TEXTFILE SELECT * FROM turn_action WHERE dt=$2 ORDER BY action_time DESC;"

python remove_dupes_turn.py $duplicate_window_time_seconds $dupes_csv_in_dir $turn_dupes_filtered_out_dir

hive -e "LOAD DATA LOCAL INPATH '$turn_dupes_filtered_out_dir' INTO TABLE turn_action_filtered PARTITION (dt=$2);"
fi


# Handle Chango Converions
if [ $1 == chango ]; then
hive -e "INSERT OVERWRITE LOCAL DIRECTORY '$dupes_csv_in_dir' ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' STORED AS TEXTFILE SELECT action_timestamp,exchange_id,chango_token,bid_id,campaign_id,ad_id,account_id,tactic_id,action,domain,media_cost,creative_views,country,region,user_timezone,ad_dimensions,ad_position,ip,user_agent,partner_user_id,partner_secondary_user_id,dt  FROM chango_ica_new WHERE dt=$2 and action='CO' ORDER BY action_timestamp DESC;"

python remove_dupes_chango.py $duplicate_window_time_seconds $dupes_csv_in_dir $chango_dupes_filtered_out_dir

hive -e "LOAD DATA LOCAL INPATH '$chango_dupes_filtered_out_dir' INTO TABLE chango_conversion_filtered PARTITION (dt=$2);"
fi