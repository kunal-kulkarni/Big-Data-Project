#!/bin/bash

# Read the config properties
. campaign_insights.properties

if [ "$CLUSTER" == "apollo" ]
then
 echo "Using Apollo cluster"
 source /usr/local/bin/setup_apollo_env
 HADOOP_LIB_JAR=$HADOOP_HOME/share/hadoop/common/lib/*:$HADOOP_HOME/share/hadoop/hdfs/*:$HADOOP_HOME/share/hadoop/hdfs/lib/*:$HADOOP_HOME/share/hadoop/common/*

 export HADOOP_CORE_JAR=$HADOOP_LIB_JAR
 export HADOOP_CORE_SITE_XML=$HADOOP_CONF_DIR/core-site.xml 
fi


if [ ! -d $HADOOP_HOME ]
then
	echo "Please set Hadoop home directory to HADOOP_HOME $HADOOP_HOME"
        exit 1;
fi

chango_check_partition()
{
	local _partition_date=$1

	# check if data is present
	local _partition_present=`hive -e "SHOW PARTITIONS chango_ica_new PARTITION(dt=$_partition_date)" -S  | grep $_partition_date`
	if [ -z $_partition_present ]
    then
        local _output="No"
    else
        local _output="Yes"
    fi

    echo $_output
}

turn_check_partition()
{
	local _partition_date=$1

	# check if data is present
	local _partition_present=`hive -e "SHOW PARTITIONS turn_action PARTITION(dt=$_partition_date)" -S  | grep $_partition_date`
	if [ -z $_partition_present ]
    then
        local _output="No"
    else
        local _output="Yes"
    fi

    echo $_output
}

if [ $(chango_check_partition) == Yes ]
then

	# Delete today's partition from denormalized table for Chango data if it exists
	hive -e "ALTER TABLE $denormalized_table_name DROP IF EXISTS PARTITION(dt = $1, data_provider = 22)"
	
	# Take care of Chango conversion duplicates
	./conversion_dupes.sh chango $1

	# Extract Chango data into Denormalized tabel
	hive -S -hiveconf MY_VAR1=$1 -hiveconf MY_VAR2=$2 -hiveconf MY_VAR3=denormalized_table_name -hiveconf MY_VAR5=chango_conversions_filtered_table_name -f Chango_Extract.hql
fi

if [ $(turn_check_partition) == Yes ]
then
	
	# Delete today's partition from denormalized table for Turn data if it exists
	hive -e "ALTER TABLE $denormalized_table_name DROP IF EXISTS PARTITION(dt = $1, data_provider = 61)"

	# Take care of Turn conversion duplicates
	./conversion_dupes.sh turn $1

	# Extract Turn data into Denormalized tabel
	hive -S -hiveconf MY_VAR1=$1 -hiveconf MY_VAR2=$2 -hiveconf MY_VAR3=denormalized_table_name -hiveconf MY_VAR4=turn_conversions_filtered_table_name -f Turn_Extract.hql
fi


# Export the De-normalized data for this day into HDFS so that it can be consumed by Druid
hive -e "INSERT OVERWRITE DIRECTORY druid_hdfs_data_loc ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' STORED AS TEXTFILE SELECT * FROM denormalized_table_name WHERE dt=$1;"