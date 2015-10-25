set yarn.app.mapreduce.am.resource.mb=4096;
set yarn.app.mapreduce.am.command-opts=-Xmx3276m;
set mapreduce.job.max.split.locations=200;
set mapreduce.user.classpath.first=true;
set hive.exec.compress.output=true;
set hive.exec.parallel=true;

add jar /data1/tmp/kunal/campaign-insights-udf.jar;
CREATE TEMPORARY FUNCTION getTimeTZ as 'com.ebay.advertising.dmp.udf.FromUnixtimeWithTZ';
CREATE TEMPORARY FUNCTION getDayofWeek as 'com.ebay.advertising.dmp.udf.GetDayOfWeek';
CREATE TEMPORARY FUNCTION getConversionLagBucket  as 'com.ebay.advertising.dmp.udf.GetConversionLagBucket';


INSERT INTO TABLE ${hiveconf:denormalized_tbl} PARTITION(data_provider_id = '61', event_type = 'CO', dt)

SELECT
	all_conv_filtered_events.action_time,
	cast(all_conv_filtered_events.user_id AS string),
	all_conv_filtered_events.mp_insertion_order_id,
	all_conv_filtered_events.mp_package_id,
	all_conv_filtered_events.mp_line_item_id,
	all_conv_filtered_events.mp_advertiser_id,
	all_conv_filtered_events.mp_creative_id,
	CASE WHEN length(all_conv_filtered_events.media_channel_id) > 0 THEN all_conv_filtered_events.media_channel_id ELSE NULL END,
	CASE WHEN length(all_conv_filtered_events.contextual_category_id) > 0 THEN all_conv_filtered_events.contextual_category_id ELSE NULL END,
	NULL,
	NULL, 
	NULL, 
	NULL, 
	NULL,
	getDayofWeek(pmod(datediff(to_date(getTimeTZ(all_conv_filtered_events.action_time,"America/New_York")),'1970-01-04'),7)),
 	hour(getTimeTZ(all_conv_filtered_events.action_time,"America/New_York")),
	last_clk_imp_details.last_clk_time,
	NULL,
	last_clk_imp_details.click_count,
	all_conv_filtered_events.impression_time,
	NULL,
	last_clk_imp_details.imp_count,
	last_clk_imp_details.total_imp_cost,
	CASE WHEN length(all_conv_filtered_events.impression_time) > 0 THEN all_conv_filtered_events.action_time - all_conv_filtered_events.impression_time ELSE NULL END,
	CASE WHEN length(all_conv_filtered_events.impression_time) > 0 THEN getConversionLagBucket(all_conv_filtered_events.action_time - all_conv_filtered_events.impression_time) ELSE NULL END,
	NULL,
	NULL,
	NULL,
	all_conv_filtered_events.city,
	to_date(getTimeTZ(all_conv_filtered_events.action_time,"America/New_York"))


FROM
(
	SELECT action_time, mp_insertion_order_id, user_id, mp_package_id, mp_line_item_id, mp_advertiser_id, media_channel_id, mp_creative_id, contextual_category_id, impression_time, city
	FROM ${hiveconf:turn_action_filtered_tbl}
	WHERE dt = ${hiveconf:current_dt}
) AS all_conv_filtered_events

LEFT OUTER JOIN

(
	SELECT imp_details.insertion_order_id_1 AS campaign_id, imp_details.user_id_1 AS userid, imp_details.action_time_1 AS actn_time, imp_details.imp_freq_count AS imp_count, imp_details.total_cost AS total_imp_cost, clk_info.last_click_time AS last_clk_time, clk_info.click_ct AS click_count

	FROM

	(
		SELECT conversion.mp_insertion_order_id AS insertion_order_id_1, conversion.user_id AS user_id_1, conversion.action_time AS action_time_1, COUNT(*) AS imp_freq_count, SUM(imp.cost) AS total_cost

		FROM
		(
			SELECT mp_insertion_order_id, user_id, action_time
			FROM ${hiveconf:turn_action_filtered_tbl}
			WHERE dt = ${hiveconf:current_dt}

		) AS conversion

		JOIN

		(
			SELECT mp_insertion_order_id, user_id, impression_time, cost
			FROM turn_impression
			WHERE dt between ${hiveconf:lookback_dt} AND ${hiveconf:current_dt}
		) AS imp

		ON (
			conversion.mp_insertion_order_id = imp.mp_insertion_order_id AND
			conversion.user_id = imp.user_id
		)

		WHERE imp.impression_time < conversion.action_time
		GROUP BY conversion.mp_insertion_order_id, conversion.action_time, conversion.user_id
	) AS imp_details

	LEFT OUTER JOIN

	(
		SELECT conversion_clk_query.mp_insertion_order_id AS insertion_order_id_2, conversion_clk_query.user_id AS user_id_2, conversion_clk_query.action_time AS action_time_2, max(clk.click_time) as last_click_time, COUNT(*) AS click_ct

		FROM
		(
			SELECT mp_insertion_order_id, user_id, action_time
			FROM ${hiveconf:turn_action_filtered_tbl}
			WHERE dt = ${hiveconf:current_dt}
		) AS conversion_clk_query

		JOIN

		(
			SELECT mp_insertion_order_id, user_id, click_time
			FROM turn_clicks
			WHERE dt between ${hiveconf:lookback_dt} AND ${hiveconf:current_dt}
		) AS clk

		ON (conversion_clk_query.mp_insertion_order_id = clk.mp_insertion_order_id AND
				conversion_clk_query.user_id = clk.user_id
		)

		WHERE 	clk.click_time < conversion_clk_query.action_time
		GROUP BY conversion_clk_query.mp_insertion_order_id, conversion_clk_query.user_id, conversion_clk_query.action_time

	) AS clk_info

	ON
	(
		clk_info.action_time_2 = imp_details.action_time_1 AND
		clk_info.insertion_order_id_2 = imp_details.insertion_order_id_1 AND
		clk_info.user_id_2 = imp_details.user_id_1
	)

) AS last_clk_imp_details

ON
(
	all_conv_filtered_events.mp_insertion_order_id = last_clk_imp_details.campaign_id AND
	all_conv_filtered_events.user_id = last_clk_imp_details.userid AND
	all_conv_filtered_events.action_time = last_clk_imp_details.actn_time
)
;



Insert INTO TABLE ${hiveconf:denormalized_tbl} partition(data_provider_id = '61', event_type = 'CL', dt) 

SELECT 
	turn_clicks_all.click_time,
	cast(turn_clicks_all.user_id AS string),
	turn_clicks_all.mp_insertion_order_id,
	turn_clicks_all.mp_package_id,
	turn_clicks_all.mp_line_item_id,
	turn_clicks_all.mp_advertiser_id,
	turn_clicks_all.mp_creative_id,
	CASE WHEN length(turn_clicks_all.media_channel_id) > 0 THEN turn_clicks_all.media_channel_id ELSE NULL END,
	CASE WHEN length(turn_clicks_all.contextual_category_id) > 0 THEN turn_clicks_all.contextual_category_id ELSE NULL END,
	NULL, 
	NULL, 
	NULL,
	NULL,
	NULL,
	getDayofWeek(pmod(datediff(to_date(getTimeTZ(turn_clicks_all.click_time,"America/New_York")),'1970-01-04'),7)),
 	hour(getTimeTZ(turn_clicks_all.click_time,"America/New_York")), 
	NULL,
	NULL, 
	NULL,
	turn_clicks_all.impression_time,
	NULL,
	last_imp_details_clk.imp_ct,
	NULL,
	NULL,
	NULL, 
	NULL, 
	NULL,
	NULL,
	city,
	to_date(getTimeTZ(turn_clicks_all.click_time,"America/New_York"))

FROM
(
	SELECT click_time, mp_insertion_order_id, user_id, mp_package_id, mp_line_item_id, mp_advertiser_id, mp_creative_id, media_channel_id, contextual_category_id, impression_time, city
	FROM turn_clicks 
	WHERE dt = ${hiveconf:current_dt}
) AS turn_clicks_all

LEFT OUTER JOIN

(
	SELECT turn_clk.click_time AS clk_time, turn_clk.mp_insertion_order_id AS campaign_id, turn_clk.user_id AS userid, COUNT(*) AS imp_ct

	FROM 

	(	
		SELECT click_time, mp_insertion_order_id, user_id
		FROM turn_clicks 
		WHERE dt = ${hiveconf:current_dt}
	) AS turn_clk

	JOIN 

	(
		SELECT impression_time, mp_insertion_order_id, user_id
		FROM turn_impression 
		WHERE dt between ${hiveconf:lookback_dt} AND ${hiveconf:current_dt}
	) AS turn_imp

	ON
	(
		turn_clk.mp_insertion_order_id = turn_imp.mp_insertion_order_id AND
		turn_clk.user_id = turn_imp.user_id
	)

	WHERE turn_imp.impression_time < turn_clk.click_time
	GROUP BY turn_clk.click_time, turn_clk.mp_insertion_order_id, turn_clk.user_id

) AS last_imp_details_clk

ON
(
	last_imp_details_clk.clk_time = turn_clicks_all.click_time AND
	last_imp_details_clk.campaign_id = turn_clicks_all.mp_insertion_order_id AND
	last_imp_details_clk.userid = turn_clicks_all.user_id
)
;



INSERT INTO TABLE ${hiveconf:denormalized_tbl} PARTITION(data_provider_id = '61', event_type = 'IM', dt)

SELECT 
	impression_time,
	cast(user_id AS string),
	mp_insertion_order_id,
	mp_package_id,
	mp_line_item_id,
	mp_advertiser_id,
	mp_creative_id,
	CASE WHEN length(media_channel_id) > 0 THEN media_channel_id ELSE NULL END,
	CASE WHEN length(contextual_category_id) > 0 THEN contextual_category_id ELSE NULL END,
	NULL, 
	NULL, 
	NULL,
	NULL,
	cost,
	getDayofWeek(pmod(datediff(to_date(getTimeTZ(impression_time,"America/New_York")),'1970-01-04'),7)),
 	hour(getTimeTZ(impression_time,"America/New_York")),
	NULL, 
	NULL, 
	NULL, 
	NULL, 
	NULL, 
	NULL,
	NULL, 
	NULL, 
	NULL,
	NULL, 
	NULL, 
	NULL,
	city,
	to_date(getTimeTZ(impression_time,"America/New_York"))

FROM turn_impression 
WHERE dt = ${hiveconf:current_dt}
;