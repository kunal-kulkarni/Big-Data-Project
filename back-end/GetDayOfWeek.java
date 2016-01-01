package com.ebay.advertising.dmp.udf;

import org.apache.hadoop.hive.ql.exec.Description;
import org.apache.hadoop.hive.ql.exec.UDF;
import java.util.*;
import java.text.*;

public class GetDayOfWeek extends UDF {


        public String evaluate(int dateDiff) {

                String dayOfWeek = "";
            switch (dateDiff) {

            case 0:  dayOfWeek = "Sun";
                     break;
            case 1:  dayOfWeek = "Mon";
                     break;
            case 2:  dayOfWeek = "Tue";
                     break;
            case 3:  dayOfWeek = "Wed";
                     break;
            case 4:  dayOfWeek = "Thu";
                     break;
            case 5:  dayOfWeek = "Fri";
                     break;
            case 6:  dayOfWeek = "Sat";
                     break;
           	}

           	return dayOfWeek;
        }
}