package com.ebay.advertising.dmp.udf;

import org.apache.hadoop.hive.ql.exec.Description;
import org.apache.hadoop.hive.ql.exec.UDF;
import java.util.*;
import java.text.*;

public class GetConversionLagBucket extends UDF {


        public String evaluate(long lagTime) {

            String lagBucket = "";

            if(lagTime < 1800){
                lagBucket = "<30min";
            } else if (lagTime < 3600) {
                lagBucket = "<1hr";
            } else if (lagTime < 21600) {
                lagBucket = "1-6 hr";
            } else if (lagTime < 43200) {
                lagBucket = "7-12 hr";
            } else if (lagTime < 64800) {
                lagBucket = "13-18 hr";
            } else if (lagTime < 86400) {
                lagBucket = "19-24 hr";
            } else if (lagTime < 172800) {
                lagBucket = "1-2 days";
            } else if (lagTime < 259200) {
                lagBucket = "2-3 days";
            } else if (lagTime < 432000) {
                lagBucket = "3-5 days";
            } else {
                lagBucket = ">5 days";
            }
            

           	return lagBucket;
        }
}