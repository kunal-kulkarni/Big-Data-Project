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


INSERT INTO TABLE ${hiveconf:denormalized_tbl} PARTITION(data_provider_id = '22', event_type = 'CO', dt)

SELECT 
 	chango_conv_filtered_records.action_timestamp,
 	chango_conv_filtered_records.chango_token,
 	chango_conv_filtered_records.campaign_id, 
 	chango_conv_filtered_records.tactic_id,
 	NULL,
 	NULL,
 	NULL,
 	NULL,
 	NULL,
 	chango_conv_filtered_records.exchange_id, 
 	chango_conv_filtered_records.ad_id,
 	chango_conv_filtered_records.ad_dimensions,
 	parse_url(if(instr(chango_conv_filtered_records.domain,'http://') > 0,chango_conv_filtered_records.domain,concat('http://',chango_conv_filtered_records.domain)),'HOST'),
 	NULL,
 	getDayofWeek(pmod(datediff(to_date(getTimeTZ(chango_conv_filtered_records.action_timestamp,"America/New_York")),'1970-01-04'),7)),
 	hour(getTimeTZ(chango_conv_filtered_records.action_timestamp,"America/New_York")),
 	last_imp_clk_details.last_click_event_time,
 	parse_url(if(instr(last_imp_clk_details.last_click_domain,'http://') > 0,last_imp_clk_details.last_click_domain,concat('http://',last_imp_clk_details.last_click_domain)),'HOST'),
 	last_imp_clk_details.click_count,
 	last_imp_clk_details.last_impression_time,
 	parse_url(if(instr(last_imp_clk_details.last_impression_domain,'http://') > 0,last_imp_clk_details.last_impression_domain,concat('http://',last_imp_clk_details.last_impression_domain)),'HOST'),
 	last_imp_clk_details.impression_count,
 	NULL,
 	CASE WHEN length(last_imp_clk_details.last_impression_time) > 0 THEN chango_conv_filtered_records.action_timestamp - last_imp_clk_details.last_impression_time ELSE NULL END,
 	CASE WHEN length(last_imp_clk_details.last_impression_time) > 0 THEN getConversionLagBucket(chango_conv_filtered_records.action_timestamp - last_imp_clk_details.last_impression_time) ELSE NULL END,
 	chango_conv_filtered_records.user_agent,
 	CASE WHEN length(chango_conv_filtered_records.country) > 0 THEN chango_conv_filtered_records.country ELSE NULL END,
 	CASE WHEN length(chango_conv_filtered_records.region) > 0 THEN chango_conv_filtered_records.region ELSE NULL END,
 	NULL,
 	to_date(getTimeTZ(chango_conv_filtered_records.action_timestamp,"America/New_York"))

FROM
(
	SELECT action_timestamp, campaign_id, chango_token, tactic_id, exchange_id, ad_id, country, region, ad_dimensions, domain, user_agent

	FROM ${hiveconf:chango_action_filtered_tbl} 
	WHERE dt = ${hiveconf:current_dt}
) AS chango_conv_filtered_records

LEFT OUTER JOIN

(
	SELECT last_imp_details.convertime AS convertion_time, last_imp_details.camp_id AS conv_campaign_id, last_imp_details.tok_id AS conv_chango_token, last_imp_details.lastImpTime AS last_impression_time, last_imp_details.imp_domain AS last_impression_domain, last_imp_details.freq_bkt AS impression_count, last_clk_details.clk_count AS click_count, last_clk_details.lastClkTime AS last_click_event_time, last_clk_details.clk_domain AS last_click_domain

	FROM
	(

		SELECT  last_imp_time_freq_ct.action_timestamp_1 AS convertime, 
			last_imp_time_freq_ct.campaign_id_1 AS camp_id, 
			last_imp_time_freq_ct.chango_token_1 AS tok_id,
			last_imp_time_freq_ct.last_imp_time AS lastImpTime, 
			chango_imp.last_imp_domain AS imp_domain, 
			last_imp_time_freq_ct.imp_freq_ct AS freq_bkt

		FROM
		(
			SELECT conv.campaign_id AS campaign_id_1, conv.chango_token AS chango_token_1, conv.action_timestamp as action_timestamp_1, COUNT(*) as imp_freq_ct, max(imp.action_timestamp) as last_imp_time

			FROM

			(
				SELECT chango_token, campaign_id, action_timestamp
				FROM ${hiveconf:chango_action_filtered_tbl} 
				WHERE dt = ${hiveconf:current_dt}
			) AS conv

			JOIN 

			(
				SELECT chango_token, campaign_id, action_timestamp
				FROM chango_ica_new 
				WHERE action = 'IM' AND dt between ${hiveconf:lookback_dt} AND ${hiveconf:current_dt} 
			) AS imp

			ON 
			(
				conv.chango_token = imp.chango_token AND 
				conv.campaign_id = imp.campaign_id
			)

			WHERE imp.action_timestamp < conv.action_timestamp
			GROUP BY conv.campaign_id, conv.chango_token, conv.action_timestamp

		) AS last_imp_time_freq_ct

		LEFT OUTER JOIN

		(
			SELECT campaign_id, chango_token, action_timestamp, max(domain) as last_imp_domain
				FROM chango_ica_new
			WHERE dt between ${hiveconf:lookback_dt} AND ${hiveconf:current_dt}  and action = 'IM'
			GROUP BY campaign_id, chango_token, action_timestamp
		) AS chango_imp

		ON 
		(
			chango_imp.action_timestamp = last_imp_time_freq_ct.last_imp_time AND 
			chango_imp.campaign_id = last_imp_time_freq_ct.campaign_id_1 AND 
			chango_imp.chango_token = last_imp_time_freq_ct.chango_token_1
		)

	) AS last_imp_details

	LEFT OUTER JOIN
	(
		SELECT  last_clk_time_freq_ct.action_timestamp_1 AS convertime, 
			last_clk_time_freq_ct.campaign_id_1 AS camp_id, 
			last_clk_time_freq_ct.chango_token_1 AS tok_id,
			last_clk_time_freq_ct.last_clk_time AS lastClkTime,
			last_clk_time_freq_ct.clk_ct AS clk_count,
			chango_clk.last_clk_domain AS clk_domain

		FROM 
		(
			SELECT conv.action_timestamp AS action_timestamp_1, conv.campaign_id AS campaign_id_1, conv.chango_token AS chango_token_1, COUNT(*) as clk_ct, max(clk.action_timestamp) as last_clk_time

			FROM 

			(
				SELECT action_timestamp, campaign_id, chango_token
				FROM ${hiveconf:chango_action_filtered_tbl} 
				WHERE dt = ${hiveconf:current_dt}
			) AS conv

			JOIN 

			(
				SELECT action_timestamp, campaign_id, chango_token
				FROM chango_ica_new 
				WHERE action = 'CL' AND dt between ${hiveconf:lookback_dt} AND ${hiveconf:current_dt} 
			) AS clk

			ON 
			(
				conv.chango_token = clk.chango_token AND 
				conv.campaign_id = clk.campaign_id
			)

			WHERE clk.action_timestamp < conv.action_timestamp
			GROUP BY conv.action_timestamp, conv.campaign_id, conv.chango_token
			
		) AS last_clk_time_freq_ct

		LEFT OUTER JOIN

		(
			SELECT action_timestamp, campaign_id, chango_token, max(domain) as last_clk_domain
			FROM chango_ica_new
			WHERE dt between ${hiveconf:lookback_dt} AND ${hiveconf:current_dt}  and action = 'CL'
			GROUP BY action_timestamp, campaign_id, chango_token
		) AS chango_clk

		ON 
		(
			chango_clk.action_timestamp = last_clk_time_freq_ct.last_clk_time AND 
			chango_clk.campaign_id = last_clk_time_freq_ct.campaign_id_1 AND 
			chango_clk.chango_token = last_clk_time_freq_ct.chango_token_1
		)

	) AS last_clk_details

	ON
	(
		last_imp_details.convertime = last_clk_details.convertime AND
		last_imp_details.camp_id = last_clk_details.camp_id AND
		last_imp_details.tok_id = last_clk_details.tok_id
	)
) AS last_imp_clk_details

ON
(
	chango_conv_filtered_records.action_timestamp = last_imp_clk_details.convertion_time AND
	chango_conv_filtered_records.campaign_id = last_imp_clk_details.conv_campaign_id AND
	chango_conv_filtered_records.chango_token = last_imp_clk_details.conv_chango_token
)
;


INSERT INTO TABLE ${hiveconf:denormalized_tbl} PARTITION(data_provider_id = '22', event_type = 'CL', dt) 

SELECT
	chango_click.action_timestamp, 
	chango_click.chango_token,
	chango_click.campaign_id,
	chango_click.tactic_id,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	chango_click.exchange_id, 
	chango_click.ad_id, 
	chango_click.ad_dimensions,
	parse_url(if(instr(chango_click.domain,'http://') > 0,chango_click.domain,concat('http://',chango_click.domain)),'HOST'),
	NULL,
	getDayofWeek(pmod(datediff(to_date(getTimeTZ(chango_click.action_timestamp,"America/New_York")),'1970-01-04'),7)), 
	hour(getTimeTZ(chango_click.action_timestamp,"America/New_York")),
	NULL,
	NULL,
	NULL,
	last_imp_details_with_domain.last_imp_time_1, 
	parse_url(if(instr(last_imp_details_with_domain.imp_domain,'http://') > 0,last_imp_details_with_domain.imp_domain,concat('http://',last_imp_details_with_domain.imp_domain)),'HOST'),
	last_imp_details_with_domain.imp_count,
	NULL,
	NULL,
	NULL,
	chango_click.user_agent,
	CASE WHEN length(chango_click.country) > 0 THEN chango_click.country ELSE NULL END,
 	CASE WHEN length(chango_click.region) > 0 THEN chango_click.region ELSE NULL END,
 	NULL,
 	to_date(getTimeTZ(chango_click.action_timestamp,"America/New_York"))

FROM
(
	SELECT action_timestamp, campaign_id, chango_token, tactic_id, exchange_id, ad_id, country, region, ad_dimensions, domain, user_agent
	FROM chango_ica_new 
	WHERE dt = ${hiveconf:current_dt} AND action = 'CL'
) AS chango_click

LEFT OUTER JOIN
(
	SELECT last_imp_details_clk.action_timestamp_1 AS actn_timestamp, last_imp_details_clk.chango_token_1 AS chango_tok, last_imp_details_clk.campaign_id_1 AS camp_id, last_imp_details_clk.last_imp_time AS last_imp_time_1, last_imp_details_clk.imp_ct as imp_count, chango_imp.last_imp_domain_clk AS imp_domain

	FROM
	(
		SELECT chango_click.chango_token AS chango_token_1, chango_click.campaign_id AS campaign_id_1, chango_click.action_timestamp AS action_timestamp_1, COUNT(*) AS imp_ct, max(chango_imp.action_timestamp) AS last_imp_time

		FROM 

		(	
			SELECT action_timestamp, campaign_id, chango_token
			FROM chango_ica_new 
			WHERE dt = ${hiveconf:current_dt} AND action = 'CL'
		) AS chango_click

		JOIN 

		(
			SELECT action_timestamp, campaign_id, chango_token
			FROM chango_ica_new 
			WHERE action ='IM' AND dt between ${hiveconf:lookback_dt} AND ${hiveconf:current_dt}
		) AS chango_imp

		ON
		(
			chango_click.chango_token = chango_imp.chango_token AND
			chango_click.campaign_id = chango_imp.campaign_id
		)

		WHERE chango_imp.action_timestamp < chango_click.action_timestamp
		GROUP BY chango_click.chango_token, chango_click.campaign_id, chango_click.action_timestamp

	) AS last_imp_details_clk

	LEFT OUTER JOIN

	(
		SELECT campaign_id, chango_token, action_timestamp, max(domain) as last_imp_domain_clk
		FROM chango_ica_new
		WHERE action ='IM' and dt between ${hiveconf:lookback_dt} AND ${hiveconf:current_dt}
		GROUP BY action_timestamp, campaign_id, chango_token
	) AS chango_imp 

	ON 
	(
		last_imp_details_clk.last_imp_time = chango_imp.action_timestamp AND
		last_imp_details_clk.campaign_id_1 = chango_imp.campaign_id AND 
		last_imp_details_clk.chango_token_1 = chango_imp.chango_token
	)

) AS last_imp_details_with_domain

ON
(
	chango_click.action_timestamp = last_imp_details_with_domain.actn_timestamp AND
	chango_click.campaign_id = last_imp_details_with_domain.camp_id AND
	chango_click.chango_token = last_imp_details_with_domain.chango_tok
)
;



INSERT INTO TABLE ${hiveconf:denormalized_tbl} PARTITION(data_provider_id ='22', event_type = 'IM', dt)

SELECT
	action_timestamp,
	chango_token,
	campaign_id,
	tactic_id,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	exchange_id, 
	ad_id,
	ad_dimensions,
	parse_url(if(instr(domain,'http://') > 0,domain,concat('http://',domain)),'HOST'),
	NULL,
	getDayofWeek(pmod(datediff(to_date(getTimeTZ(action_timestamp,"America/New_York")),'1970-01-04'),7)), 
	hour(getTimeTZ(action_timestamp,"America/New_York")),
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	user_agent,
	country,
	region,
	NULL,
	to_date(getTimeTZ(action_timestamp,"America/New_York"))

FROM chango_ica_new 
WHERE dt = ${hiveconf:current_dt} AND action = "IM"
;