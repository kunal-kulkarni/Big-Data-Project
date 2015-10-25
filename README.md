Usage:

This project generates campaign insight performance reports based on Turn and Chango data in Hive ICA tables.

To generate data at backend please do -
./run.sh 20150710 20150611

where,
the first argument to run.sh is the today's date (20150710 is July 10 2015) or the date on which to run the scripts to generate backend data 
the second argument is the look back date used to get last impression, last click details and no. of impressions taken for the conversion. In this example it is 30 days back
