Usage:

This project generates campaign insight performance reports based on Turn and Chango data in Hive Impressions, Clicks, Action (Conversion) tables.

To generate data at backend please do -
./run.sh 20150710 20150611

where,
the first argument to run.sh is the today's date (20150710 is July 10 2015) or the date on which to run the scripts to generate backend data 
the second argument is the look back date used to get last impression, last click details and no. of impressions taken for the conversion. In this example it is 30 days back

Hadoop Cluster is required to run the Hive Scripts. Raw data is stored in HDFS layer in HIVE tables. Results of Hive execution is stored in a single de-normalized Hive table. This data is next ingested in Pinot NOSQL distributed database.

D3.js Javascript is used at front end to display insights as visual reports. AJAX POST request to the Pinot Server contains the Pinot Query and Pinot sends the response as JSON containing the query result. Analytics Queries are run aganist Pinot Distributed Database to get insights which is then visually displayed beautifully using D3.js
