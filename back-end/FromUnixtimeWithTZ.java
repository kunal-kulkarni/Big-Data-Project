package com.ebay.advertising.dmp.udf;

import org.apache.hadoop.hive.ql.exec.Description;
import org.apache.hadoop.hive.ql.exec.UDF;
import java.util.*;
import java.text.*;

@Description(name = "from_unixtime_with_tz",
value = "_FUNC_(epochtime, string) - returns date in that timezone for that epoch")
public class FromUnixtimeWithTZ extends UDF {

        private String timezone = "UTC";

        public String evaluate(long epochTime, String timezone) {

                Date date = new Date(epochTime*1000);
                DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                format.setTimeZone(TimeZone.getTimeZone(timezone));
                String formatted = format.format(date);

                return formatted;
        }
}