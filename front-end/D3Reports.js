// Ofcourse this code can be made more cleaner and shorter. But current code is working code and gets the job done. Due to time constraints it was not cleaned up
// D3.js was used to generate the graphs 


function loadXMLDoc()
{ 
  var total_conv;
  d3.selectAll("svg").remove();
  var start_date = document.getElementById('startdate').value;

  var end_date = document.getElementById('enddate').value;

  var dsp = document.getElementById('dataprovider').value;
  var dp;
  if(dsp == "chango")
    dp = '22';
  else
    dp = '61';

  var campaign_selection = document.getElementById('campaign').value;

  document.getElementById("tod_report").style.visibility = 'visible';
  document.getElementById("domain").style.visibility = 'hidden';    


  var query_cond = "'".concat(start_date,"' and '",end_date,"' and data_provider_id = ",dp);
  if(campaign_selection != 'All')
    query_cond = query_cond.concat(" and campaign_id = ",campaign_selection);

  var query1 = "select count(*) from ica_table where event_type='CO' and dt between ".concat(query_cond," group by attr_time_of_day top 24");
  var pinot_query123 = JSON.stringify({"pql":query1});

  jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query123,
  success:onBarChartData2
  }
  );

  function onBarChartData2(data){
   //var myarr = JSON.parse(xmlhttp.responseText).aggregationResults[0].groupByResult;
   var myarr = JSON.parse(data).aggregationResults[0].groupByResult;
        total_conv = JSON.parse(data).numDocsScanned;
        document.getElementById("total").innerHTML = total_conv;

    
      myarr.forEach(function(d){
    d.value = +d.value;
    d.group = +d.group;
  });

      var tod = [];
      for (var i=0; i<myarr.length; i++)
      {
        tod.splice(myarr[i].group, 0, myarr[i].value);
      }

      var todJsonString = [];
       for (var i=0; i<tod.length; i++)
      {
        todJsonString.push({'value' : tod[i], 'group' : i.toString()});
      }


      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "Count: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv1").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(todJsonString.map(function(d) { return d.group; }));
    y.domain([0, d3.max(todJsonString, function(d) { return d.value; })]);

    dx = width / todJsonString.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "+.1em")
        .attr("dy", "+.45em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar")
        .data(todJsonString)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", function(d, i) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 50 })
        .duration(50)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());

        
      svg.selectAll("bar")
        .data(todJsonString)
        .enter().append("text")
        .attr("class", function(d, i) {return "group " + x(d.group);})
        .transition()
        .delay(function(d, i) { return i * 50 })
        .duration(50)
        .attr("x", function(d, i) {return x(d.group) + (dx/2 - 10); })
        .attr("y", function(d, i) { return y(d.value) - 6;})
        .text( function(d) {return d.value; })
        .attr("font-size", "9px")
        .style("font-weight", "bold");
  }


  query2 = "select count(*) from ica_table where event_type='CO' and dt between ".concat(query_cond," group by attr_day_of_week");

  var pinot_query_dow = JSON.stringify({"pql":query2});


  jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_dow,
  success:onBarChartData_dow
  }
  );


  function onBarChartData_dow(data){

     var myarr = JSON.parse(data).aggregationResults[0].groupByResult;

     var dow_res = [0,0,0,0,0,0,0]
    
      myarr.forEach(function(d){
    d.value = +d.value;
  });
       for (var i=0; i<myarr.length; i++)
      {
          if(myarr[i].group == "Sun"){
          dow_res.splice(0, 1, myarr[i].value);}
          else if (myarr[i].group == 'Mon'){
          dow_res.splice(1, 1, myarr[i].value);}
          else if (myarr[i].group == 'Tue'){
          dow_res.splice(2, 1, myarr[i].value);}
          else if (myarr[i].group == 'Wed'){
          dow_res.splice(3, 1, myarr[i].value);}
          else if (myarr[i].group == 'Thu'){
          dow_res.splice(4, 1, myarr[i].value);}
          else if (myarr[i].group == 'Fri'){
          dow_res.splice(5, 1, myarr[i].value);}
          else{
          dow_res.splice(6, 1, myarr[i].value);}
      }

      var ctrJsonString22 = [];

      ctrJsonString22.push({'value' : dow_res[0], 'group' : "Sun"});
      ctrJsonString22.push({'value' : dow_res[1], 'group' : "Mon"});
      ctrJsonString22.push({'value' : dow_res[2], 'group' : "Tue"});
      ctrJsonString22.push({'value' : dow_res[3], 'group' : "Wed"});
      ctrJsonString22.push({'value' : dow_res[4], 'group' : "Thu"});
      ctrJsonString22.push({'value' : dow_res[5], 'group' : "Fri"});
      ctrJsonString22.push({'value' : dow_res[6], 'group' : "Sat"});


      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "Count: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv4").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(ctrJsonString22.map(function(d) { return d.group; }));
    y.domain([0, d3.max(ctrJsonString22, function(d) { return d.value; })]);

    dx = width / ctrJsonString22.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "+.5em")
        .attr("dy", "+.45em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar4")
        .data(ctrJsonString22)
        .enter().append("rect")
        .attr("class", "bar4")
        .attr("y", function(d, i) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 400 })
        .duration(400)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());

        
      svg.selectAll("bar4")
        .data(ctrJsonString22)
        .enter().append("text")
        .attr("class", function(d, i) {return "group " + x(d.group);})
        .transition()
        .delay(function(d, i) { return i * 400 })
        .duration(400)
        .attr("x", function(d, i) {return x(d.group) + (dx/2 - 10); })
        .attr("y", function(d, i) { return y(d.value) - 6;})
        .text( function(d) {return d.value; })
        .attr("font-size", "9px")
        .style("font-weight", "bold");

        kk3();
    }


  query3 = "select count(*) from ica_table where attr_impression_count not in (0) and event_type='CO' and dt between ".concat(query_cond," group by attr_impression_count top 7");
  var pinot_query_impct = JSON.stringify({"pql":query3});


  function kk3(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_impct,
  success:onBarChartData_impct
  }
  );
  }

  function onBarChartData_impct(data){


     var myarr = JSON.parse(data).aggregationResults[0].groupByResult;

    
      myarr.forEach(function(d){
    d.value = +d.value;
    d.group = +d.group;
  });

      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "Count: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv3").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(myarr.map(function(d) { return d.group; }));
    y.domain([0, d3.max(myarr, function(d) { return d.value; })]);

    dx = width / myarr.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "+.01em")
        .attr("dy", "+.30em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar1")
        .data(myarr)
        .enter().append("rect")
        .attr("class", "bar1")
        .attr("y", function(d, i) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 400 })
        .duration(400)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());

        
      svg.selectAll("bar1")
        .data(myarr)
        .enter().append("text")
        .attr("class", function(d, i) {return "group " + x(d.group);})
        .transition()
        .delay(function(d, i) { return i * 400 })
        .duration(400)
        .attr("x", function(d, i) {return x(d.group) + (dx/2 - 10); })
        .attr("y", function(d, i) { return y(d.value) - 6;})
        .text( function(d) {return d.value; })
        .attr("font-size", "9px")
        .style("font-weight", "bold");

        if(dp == '22'){
          top_domain();
        }
         cl_tod();
      }


    query4 = "select count(*) from ica_table where attr_last_impression_domain not in ('null','https') and event_type='CO' and dt between ".concat(query_cond," group by attr_last_impression_domain");
    var pinot_query_top_domain = JSON.stringify({"pql":query4});


    function top_domain(){
      jQuery.ajax({
      type:"POST",
      url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
      data:pinot_query_top_domain,
      success:onBarChartData_top_domain
    }
  );
  }

  function onBarChartData_top_domain(data){
    document.getElementById("domain").style.visibility = 'visible';

   var myarr = JSON.parse(data).aggregationResults[0].groupByResult;
         //document.getElementById("myDiv2").innerHTML=xmlhttp4.responseText;

      
        myarr.forEach(function(d){
      d.value = +d.value;
    });

        var margin = {top: 50, right: 20, bottom: 500, left: 40},
        width = 1125 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

        var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-25, 0])
      .html(function(d) {
        return "Count: <span style='color:red'>" + d.value + "</span>";
      })


    var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom") ;

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    var svg = d3.select("#myDiv2").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")")
        svg.call(tip);
     
      x.domain(myarr.map(function(d) { return d.group; }));
      y.domain([0, d3.max(myarr, function(d) { return d.value; })]);

      dx = width / myarr.length;

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-60)" );

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end");  

      svg.selectAll("bar1")
          .data(myarr)
          .enter().append("rect")
          .attr("class", "bar1")
          .attr("y", function(d, i) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          .transition()
          .delay(function(d, i) { return i * 400 })
          .duration(400)
          .attr("x", function(d, i) { return x(d.group); })
          .attr("width", x.rangeBand());

          
        svg.selectAll("bar1")
          .data(myarr)
          .enter().append("text")
          .attr("class", function(d, i) {return x(d.group);})
          .transition()
          .delay(function(d, i) { return i * 400 })
          .duration(400)
          .attr("x", function(d, i) {return x(d.group) + (dx/2 - 10); })
          .attr("y", function(d, i) { return y(d.value) - 6;})
          .text( function(d) {return d.value; })
          .attr("font-size", "9px")
          .style("font-weight", "bold");
  }


  var clicks = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

  query5 = "select count(*) from ica_table where event_type='CL' and dt between ".concat(query_cond," group by attr_time_of_day top 24");
  var pinot_query_cl_tod = JSON.stringify({"pql":query5});



  function cl_tod(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_cl_tod,
  success:onBarChartData_cl_tod
  }
  );
  }


  function onBarChartData_cl_tod(data){
    var myarr = JSON.parse(data).aggregationResults[0].groupByResult;
       //document.getElementById("myDiv5").innerHTML=data;
    
      myarr.forEach(function(d){
    d.value = +d.value;
    d.group = +d.group;
  });

      for (var i=0; i<myarr.length; i++)
      {
        clicks.splice(myarr[i].group, 1, myarr[i].value);
      }
      ctr_result();
  }

  query6 = "select count(*) from ica_table where event_type='IM' and dt between ".concat(query_cond," group by attr_time_of_day top 24");
  var pinot_query_im_tod = JSON.stringify({"pql":query6});

  function ctr_result(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_im_tod,
  success:onBarChartData
  }
  );

  }

  var impressions = [1,3,5,7,9,1,3,5,7,9,1,3,5,7,9,1,3,5,7,9,1,3,5,7]


  function onBarChartData(data){


     var myarr = JSON.parse(data).aggregationResults[0].groupByResult;
    
      myarr.forEach(function(d){
    d.value = +d.value;
  });

      for (var i=0; i<myarr.length; i++)
      {
        impressions.splice(myarr[i].group, 1, myarr[i].value);
      }

       var ctr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
       //clicks.splice(0, 2);

       for (var i=0; i<impressions.length; i++)
      {
          var res = (clicks[i]/impressions[i])*100;
          ctr.splice(i, 1, res);
      }

      var ctrJsonString = [];
       for (var i=0; i<ctr.length; i++)
      {
        ctrJsonString.push({'value' : ctr[i], 'group' : i.toString()});
      }

      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "CTR: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv5").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(ctrJsonString.map(function(d) { return d.group; }));
    y.domain([0, d3.max(ctrJsonString, function(d) { return d.value; })]);

    dx = width / ctrJsonString.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "+.5em")
        .attr("dy", "+.36em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar3")
        .data(ctrJsonString)
        .enter().append("rect")
        .attr("class", "bar3")
        .attr("y", function(d, i) {return y(d.value);})
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 200 })
        .duration(200)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());

       cl_dow();
  }


  var clk_dow = [0,0,0,0,0,0,0]
  query5 = "select count(*) from ica_table where event_type='CL' and dt between ".concat(query_cond," group by attr_day_of_week");
  var pinot_query_clk_dow = JSON.stringify({"pql":query5});

  function cl_dow(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_clk_dow,
  success:onBarChartData_clk_dow
  }
  );
  }


  function onBarChartData_clk_dow(data){
     myarr2 = JSON.parse(data).aggregationResults[0].groupByResult;
      //document.getElementById("myDiv6").innerHTML=xmlhttp55.responseText;

      myarr2.forEach(function(d){
    d.value = +d.value;
  });
      for (var i=0; i<myarr2.length; i++)
      {
          if(myarr2[i].group == "Sun"){
          clk_dow.splice(0, 1, myarr2[i].value);}
          else if (myarr2[i].group == 'Mon'){
          clk_dow.splice(1, 1, myarr2[i].value);}
          else if (myarr2[i].group == 'Tue'){
          clk_dow.splice(2, 1, myarr2[i].value);}
          else if (myarr2[i].group == 'Wed'){
          clk_dow.splice(3, 1, myarr2[i].value);}
          else if (myarr2[i].group == 'Thu'){
          clk_dow.splice(4, 1, myarr2[i].value);}
          else if (myarr2[i].group == 'Fri'){
          clk_dow.splice(5, 1, myarr2[i].value);}
          else{
          clk_dow.splice(6, 1, myarr2[i].value);}
      }
      im_dow();
  }


  query6 = "select count(*) from ica_table where event_type='IM' and dt between ".concat(query_cond," group by attr_day_of_week");
  var pinot_query_im_dow = JSON.stringify({"pql":query6});


  function im_dow(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_im_dow,
  success:onBarChartData_im_dow
  }
  );
  }

  var imp_dow = [1,1,1,1,1,1,1];

  function onBarChartData_im_dow(data){

   var myarr = JSON.parse(data).aggregationResults[0].groupByResult;
     //document.getElementById("myDiv7").innerHTML=xmlhttp65.responseText;
    
      myarr.forEach(function(d){
    d.value = +d.value;
  });

  var ctrJsonString5 = [];


      for (var i=0; i<myarr.length; i++)
      {
          if(myarr[i].group == "Sun"){
          imp_dow.splice(0, 1, myarr[i].value);}
          else if (myarr[i].group == 'Mon'){
          imp_dow.splice(1, 1, myarr[i].value);}
          else if (myarr[i].group == 'Tue'){
          imp_dow.splice(2, 1, myarr[i].value);}
          else if (myarr[i].group == 'Wed'){
          imp_dow.splice(3, 1, myarr[i].value);}
          else if (myarr[i].group == 'Thu'){
          imp_dow.splice(4, 1, myarr[i].value);}
          else if (myarr[i].group == 'Fri'){
          imp_dow.splice(5, 1, myarr[i].value);}
          else{
          imp_dow.splice(6, 1, myarr[i].value);}
      }

      var reslt232 = [0,0,0,0,0,0,0]
      for (var i=0; i<reslt232.length; i++)
      {
        var res43sw = (clk_dow[i]/imp_dow[i])*100;
        reslt232.splice(i, 1, res43sw);
      }

      ctrJsonString5.push({'value' : reslt232[0], 'group' : "Sun"});
      ctrJsonString5.push({'value' : reslt232[1], 'group' : "Mon"});
      ctrJsonString5.push({'value' : reslt232[2], 'group' : "Tue"});
      ctrJsonString5.push({'value' : reslt232[3], 'group' : "Wed"});
      ctrJsonString5.push({'value' : reslt232[4], 'group' : "Thu"});
      ctrJsonString5.push({'value' : reslt232[5], 'group' : "Fri"});
      ctrJsonString5.push({'value' : reslt232[6], 'group' : "Sat"});


      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "CTR: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv6").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(ctrJsonString5.map(function(d) { return d.group; }));
    y.domain([0, d3.max(ctrJsonString5, function(d) { return d.value; })]);

    dx = width / ctrJsonString5.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "+.4em")
        .attr("dy", "+.36em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar")
        .data(ctrJsonString5)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", function(d, i) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 200 })
        .duration(200)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());

        con_attr();
    }


  query5 = "select count(*) from ica_table where attr_last_click_event_time not in (0) and event_type='CO' and dt between ".concat(query_cond);
  var pinot_query_conv_attr = JSON.stringify({"pql":query5});


  function con_attr(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_conv_attr,
  success:onBarChartData_conv_attr
  }
  );
  }


  function onBarChartData_conv_attr(data){

  var myarr = JSON.parse(data).aggregationResults[0].value;
      var width = 400,
      height = 400,
      radius = Math.min(width, height) / 2;
      var view_thr = total_conv - myarr;

      var data = [];
        data.push({"value" : myarr, "group" : "Clicks"});
        data.push({"value" : view_thr, "group" : "View_Through"});

  d3.selectAll("#piechart").remove();

  var color = d3.scale.ordinal()
      .range(["orange", "blue"]);

      var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });

      var svg = d3.select("#myDiv7").append("svg")
      .attr("id","piechart")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var g = svg.selectAll(".arc")
        .data(pie(data))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.group); });

         document.getElementById("myDiv8").innerHTML = "Clicks  ".concat(myarr);
         document.getElementById("myDiv9").innerHTML = "View_Through   ".concat(view_thr);

         impr_tod();
  }


  query1 = "select count(*) from ica_table where event_type='IM' and dt between ".concat(query_cond," group by attr_time_of_day top 24");
  var pinot_query_impr_tod = JSON.stringify({"pql":query1});

  function impr_tod(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_impr_tod,
  success:onBarChartData_impr_tod
  }
  );
  }


  function onBarChartData_impr_tod(data){

    var myarr = JSON.parse(data).aggregationResults[0].groupByResult;
        total_conv = JSON.parse(data).numDocsScanned;

    
      myarr.forEach(function(d){
    d.value = +d.value;
    d.group = +d.group;
  });

      var tod = [];
      for (var i=0; i<myarr.length; i++)
      {
        tod.splice(myarr[i].group, 0, myarr[i].value);
      }

      var todJsonString = [];
       for (var i=0; i<tod.length; i++)
      {
        todJsonString.push({'value' : tod[i], 'group' : i.toString()});
      }


      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "Count: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv10").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(todJsonString.map(function(d) { return d.group; }));
    y.domain([0, d3.max(todJsonString, function(d) { return d.value; })]);

    dx = width / todJsonString.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "+.4em")
        .attr("dy", "+.36em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar3")
        .data(todJsonString)
        .enter().append("rect")
        .attr("class", "bar3")
        .attr("y", function(d, i) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 50 })
        .duration(50)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());

        impr_dow();
  }


  query2 = "select count(*) from ica_table where event_type='IM' and dt between ".concat(query_cond," group by attr_day_of_week");
  var pinot_queryimpr_dow = JSON.stringify({"pql":query2});

  function impr_dow(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_queryimpr_dow,
  success:onBarChartData_impr_dow
  }
  );
  }


  function onBarChartData_impr_dow(data){


    var myarr = JSON.parse(data).aggregationResults[0].groupByResult;
    
      myarr.forEach(function(d){
    d.value = +d.value;
  });

      var dow_res21 = [0,0,0,0,0,0,0]
    

       for (var i=0; i<myarr.length; i++)
      {
          if(myarr[i].group == "Sun"){
          dow_res21.splice(0, 1, myarr[i].value);}
          else if (myarr[i].group == 'Mon'){
          dow_res21.splice(1, 1, myarr[i].value);}
          else if (myarr[i].group == 'Tue'){
          dow_res21.splice(2, 1, myarr[i].value);}
          else if (myarr[i].group == 'Wed'){
          dow_res21.splice(3, 1, myarr[i].value);}
          else if (myarr[i].group == 'Thu'){
          dow_res21.splice(4, 1, myarr[i].value);}
          else if (myarr[i].group == 'Fri'){
          dow_res21.splice(5, 1, myarr[i].value);}
          else{
          dow_res21.splice(6, 1, myarr[i].value);}
      }



      var impression_dow = [];

      impression_dow.push({'value' : dow_res21[0], 'group' : "Sun"});
      impression_dow.push({'value' : dow_res21[1], 'group' : "Mon"});
      impression_dow.push({'value' : dow_res21[2], 'group' : "Tue"});
      impression_dow.push({'value' : dow_res21[3], 'group' : "Wed"});
      impression_dow.push({'value' : dow_res21[4], 'group' : "Thu"});
      impression_dow.push({'value' : dow_res21[5], 'group' : "Fri"});
      impression_dow.push({'value' : dow_res21[6], 'group' : "Sat"});

      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 700 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "Count: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv11").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(impression_dow.map(function(d) { return d.group; }));
    y.domain([0, d3.max(impression_dow, function(d) { return d.value; })]);

    dx = width / impression_dow.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "+.5em")
        .attr("dy", "+.36em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar4")
        .data(impression_dow)
        .enter().append("rect")
        .attr("class", "bar4")
        .attr("y", function(d, i) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 400 })
        .duration(400)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());

        
      svg.selectAll("bar4")
        .data(impression_dow)
        .enter().append("text")
        .attr("class", function(d, i) {return "group " + x(d.group);})
        .transition()
        .delay(function(d, i) { return i * 400 })
        .duration(400)
        .attr("x", function(d, i) {return x(d.group) + (dx/2 - 25); })
        .attr("y", function(d, i) { return y(d.value) - 6;})
        .text( function(d) {return d.value; })
        .attr("font-size", "9px")
        .style("font-weight", "bold");

        click_tod();
  }



  query1 = "select count(*) from ica_table where event_type='CL' and dt between ".concat(query_cond," group by attr_time_of_day top 24");
  var pinot_query_click_tod = JSON.stringify({"pql":query1});

  function click_tod(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_click_tod,
  success:onBarChartData_click_tod
  }
  );
  }


  function onBarChartData_click_tod(data){

     var myarr = JSON.parse(data).aggregationResults[0].groupByResult;
        total_conv = JSON.parse(data).numDocsScanned;

    
      myarr.forEach(function(d){
    d.value = +d.value;
    d.group = +d.group;
  });

      var tod = [];
      for (var i=0; i<myarr.length; i++)
      {
        tod.splice(myarr[i].group, 0, myarr[i].value);
      }

      var todJsonString = [];
       for (var i=0; i<tod.length; i++)
      {
        todJsonString.push({'value' : tod[i], 'group' : i.toString()});
      }


      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 1060 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "Count: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv12").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(todJsonString.map(function(d) { return d.group; }));
    y.domain([0, d3.max(todJsonString, function(d) { return d.value; })]);

    dx = width / todJsonString.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "+.01em")
        .attr("dy", "+.10em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar")
        .data(todJsonString)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", function(d, i) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 50 })
        .duration(50)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());

        
      svg.selectAll("bar")
        .data(todJsonString)
        .enter().append("text")
        .attr("class", function(d, i) {return "group " + x(d.group);})
        .transition()
        .delay(function(d, i) { return i * 50 })
        .duration(50)
        .attr("x", function(d, i) {return x(d.group) + (dx/2 - 10); })
        .attr("y", function(d, i) { return y(d.value) - 6;})
        .text( function(d) {return d.value; })
        .attr("font-size", "9px")
        .style("font-weight", "bold");

        clicks_dow();

  }

  query2 = "select count(*) from ica_table where event_type='CL' and dt between ".concat(query_cond," group by attr_day_of_week");
  var pinot_query_clicks_dow = JSON.stringify({"pql":query2});


  function clicks_dow(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_clicks_dow,
  success:onBarChartData_clicks_dow
  }
  );
  }


  function onBarChartData_clicks_dow(data){

     var myarr = JSON.parse(data).aggregationResults[0].groupByResult;
    
      myarr.forEach(function(d){
    d.value = +d.value;
  });



      var dow_res217 = [0,0,0,0,0,0,0]
    

       for (var i=0; i<myarr.length; i++)
      {
          if(myarr[i].group == "Sun"){
          dow_res217.splice(0, 1, myarr[i].value);}
          else if (myarr[i].group == 'Mon'){
          dow_res217.splice(1, 1, myarr[i].value);}
          else if (myarr[i].group == 'Tue'){
          dow_res217.splice(2, 1, myarr[i].value);}
          else if (myarr[i].group == 'Wed'){
          dow_res217.splice(3, 1, myarr[i].value);}
          else if (myarr[i].group == 'Thu'){
          dow_res217.splice(4, 1, myarr[i].value);}
          else if (myarr[i].group == 'Fri'){
          dow_res217.splice(5, 1, myarr[i].value);}
          else{
          dow_res217.splice(6, 1, myarr[i].value);}
      }



      var clicks_dow_json = [];

      clicks_dow_json.push({'value' : dow_res217[0], 'group' : "Sun"});
      clicks_dow_json.push({'value' : dow_res217[1], 'group' : "Mon"});
      clicks_dow_json.push({'value' : dow_res217[2], 'group' : "Tue"});
      clicks_dow_json.push({'value' : dow_res217[3], 'group' : "Wed"});
      clicks_dow_json.push({'value' : dow_res217[4], 'group' : "Thu"});
      clicks_dow_json.push({'value' : dow_res217[5], 'group' : "Fri"});
      clicks_dow_json.push({'value' : dow_res217[6], 'group' : "Sat"});


      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "Count: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv13").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(clicks_dow_json.map(function(d) { return d.group; }));
    y.domain([0, d3.max(clicks_dow_json, function(d) { return d.value; })]);

    dx = width / clicks_dow_json.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "+.01em")
        .attr("dy", "+.24em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar5")
        .data(clicks_dow_json)
        .enter().append("rect")
        .attr("class", "bar5")
        .attr("y", function(d, i) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 400 })
        .duration(400)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());

        
      svg.selectAll("bar5")
        .data(clicks_dow_json)
        .enter().append("text")
        .attr("class", function(d, i) {return "group " + x(d.group);})
        .transition()
        .delay(function(d, i) { return i * 400 })
        .duration(400)
        .attr("x", function(d, i) {return x(d.group) + (dx/2 - 10); })
        .attr("y", function(d, i) { return y(d.value) - 6;})
        .text( function(d) {return d.value; })
        .attr("font-size", "9px")
        .style("font-weight", "bold");

        conv_lag();

  }

  query2 = "select count(*) from ica_table where event_type='CO' and dt between ".concat(query_cond," group by attr_imp_to_conversion_lag_bucket");
  var pinot_query_conv_lag = JSON.stringify({"pql":query2});

  function conv_lag(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_conv_lag,
  success:onBarChartData_conv_lag
  }
  );
  }


  function onBarChartData_conv_lag(data){

     var myarr = JSON.parse(data).aggregationResults[0].groupByResult;
    
      myarr.forEach(function(d){
    d.value = +d.value;
  });



      var cilag = [0,0,0,0,0,0,0,0,0,0]
    
       for (var i=0; i<myarr.length; i++)
      {
          if(myarr[i].group == "<30min"){
          cilag.splice(0, 1, myarr[i].value);}
          else if (myarr[i].group == '<1hr'){
          cilag.splice(1, 1, myarr[i].value);}
          else if (myarr[i].group == '1-6 hr'){
          cilag.splice(2, 1, myarr[i].value);}
          else if (myarr[i].group == '7-12 hr'){
          cilag.splice(3, 1, myarr[i].value);}
          else if (myarr[i].group == '13-18 hr'){
          cilag.splice(4, 1, myarr[i].value);}
           else if (myarr[i].group == '19-24 hr'){
          cilag.splice(5, 1, myarr[i].value);}
           else if (myarr[i].group == '1-2 days'){
          cilag.splice(6, 1, myarr[i].value);}
           else if (myarr[i].group == '2-3 days'){
          cilag.splice(7, 1, myarr[i].value);}
           else if (myarr[i].group == '3-5 days'){
          cilag.splice(8, 1, myarr[i].value);}
          else{
          cilag.splice(9, 1, myarr[i].value);}
      }


      var conv_lag_json = [];

      conv_lag_json.push({'value' : cilag[0], 'group' : "<30min"});
      conv_lag_json.push({'value' : cilag[1], 'group' : "<1hr"});
      conv_lag_json.push({'value' : cilag[2], 'group' : "1-6 hr"});
      conv_lag_json.push({'value' : cilag[3], 'group' : "7-12 hr"});
      conv_lag_json.push({'value' : cilag[4], 'group' : "13-18 hr"});
      conv_lag_json.push({'value' : cilag[5], 'group' : "19-24 hr"});
      conv_lag_json.push({'value' : cilag[6], 'group' : "1-2 days"});
      conv_lag_json.push({'value' : cilag[7], 'group' : "2-3 days"});
      conv_lag_json.push({'value' : cilag[8], 'group' : "3-5 days"});
      conv_lag_json.push({'value' : cilag[9], 'group' : ">5 days"});


      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 700 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "Lag: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv14").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(conv_lag_json.map(function(d) { return d.group; }));
    y.domain([0, d3.max(conv_lag_json, function(d) { return d.value; })]);

    dx = width / conv_lag_json.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.05em")
        .attr("dy", "+.30em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar3")
        .data(conv_lag_json)
        .enter().append("rect")
        .attr("class", "bar3")
        .attr("y", function(d, i) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 400 })
        .duration(400)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());

        
      svg.selectAll("bar3")
        .data(conv_lag_json)
        .enter().append("text")
        .attr("class", function(d, i) {return "group " + x(d.group);})
        .transition()
        .delay(function(d, i) { return i * 400 })
        .duration(400)
        .attr("x", function(d, i) {return x(d.group) + (dx/2 - 10); })
        .attr("y", function(d, i) { return y(d.value) - 6;})
        .text( function(d) {return d.value; })
        .attr("font-size", "9px")
        .style("font-weight", "bold");

        conv_clk_ct();
  }


  query3345 = "select count(*) from ica_table where attr_click_count not in (0) and event_type='CO' and dt between ".concat(query_cond," group by attr_click_count top 5");
  var pinot_query_conv_clk_ct = JSON.stringify({"pql":query3345});


  function conv_clk_ct(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_conv_clk_ct,
  success:onBarChartData_conv_clk_ct
  }
  );
  }

  function onBarChartData_conv_clk_ct(data){


     var myarr = JSON.parse(data).aggregationResults[0].groupByResult;

    
      myarr.forEach(function(d){
        d.value = +d.value;
        d.group = +d.group;
      });

      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-25, 0])
      .html(function(d) {
        return "Count: <span style='color:red'>" + d.value + "</span>";
    })

      var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

      var y = d3.scale.linear().range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom") ;

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10);

      var svg = d3.select("#myDiv16").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")")
          svg.call(tip);
       
        x.domain(myarr.map(function(d) { return d.group; }));
        y.domain([0, d3.max(myarr, function(d) { return d.value; })]);

        dx = width / myarr.length;

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
          .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "+.01em")
            .attr("dy", "+.30em")
            .attr("transform", "rotate(-90)" );

        svg.selectAll(".x text")  // select all the text elements for the x
                .attr("transform", function(d) {
                   return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
               });

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end");  

        svg.selectAll("bar1")
            .data(myarr)
            .enter().append("rect")
            .attr("class", "bar1")
            .attr("y", function(d, i) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition()
            .delay(function(d, i) { return i * 400 })
            .duration(400)
            .attr("x", function(d, i) { return x(d.group); })
            .attr("width", x.rangeBand());

            
          svg.selectAll("bar1")
            .data(myarr)
            .enter().append("text")
            .attr("class", function(d, i) {return "group " + x(d.group);})
            .transition()
            .delay(function(d, i) { return i * 400 })
            .duration(400)
            .attr("x", function(d, i) {return x(d.group) + (dx/2 - 10); })
            .attr("y", function(d, i) { return y(d.value) - 6;})
            .text( function(d) {return d.value; })
            .attr("font-size", "9px")
            .style("font-weight", "bold");
            con_dow_();
      }

  var conv_dow = [0,0,0,0,0,0,0]
  query5 = "select count(*) from ica_table where event_type='CO' and dt between ".concat(query_cond," group by attr_day_of_week");
  var pinot_query_con_dow_= JSON.stringify({"pql":query5});

  function con_dow_(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_con_dow_,
  success:onBarChartData_con_dow_
  }
  );
  }


  function onBarChartData_con_dow_(data){
     myarr2 = JSON.parse(data).aggregationResults[0].groupByResult;
      //document.getElementById("myDiv6").innerHTML=xmlhttp55.responseText;

      myarr2.forEach(function(d){
    d.value = +d.value;
  });
      for (var i=0; i<myarr2.length; i++)
      {
          if(myarr2[i].group == "Sun"){
          conv_dow.splice(0, 1, myarr2[i].value);}
          else if (myarr2[i].group == 'Mon'){
          conv_dow.splice(1, 1, myarr2[i].value);}
          else if (myarr2[i].group == 'Tue'){
          conv_dow.splice(2, 1, myarr2[i].value);}
          else if (myarr2[i].group == 'Wed'){
          conv_dow.splice(3, 1, myarr2[i].value);}
          else if (myarr2[i].group == 'Thu'){
          conv_dow.splice(4, 1, myarr2[i].value);}
          else if (myarr2[i].group == 'Fri'){
          conv_dow.splice(5, 1, myarr2[i].value);}
          else{
          conv_dow.splice(6, 1, myarr2[i].value);}
      }
      cvr();
  }


  function cvr(){

  var cvr_json = [];

      var reslt45fr = [0,0,0,0,0,0,0]

      for (var i=0; i<reslt45fr.length; i++)
      {
        var ressw2 = (conv_dow[i]/imp_dow[i])*100;
        reslt45fr.splice(i, 1, ressw2);
      }

      cvr_json.push({'value' : reslt45fr[0], 'group' : "Sun"});
      cvr_json.push({'value' : reslt45fr[1], 'group' : "Mon"});
      cvr_json.push({'value' : reslt45fr[2], 'group' : "Tue"});
      cvr_json.push({'value' : reslt45fr[3], 'group' : "Wed"});
      cvr_json.push({'value' : reslt45fr[4], 'group' : "Thu"});
      cvr_json.push({'value' : reslt45fr[5], 'group' : "Fri"});
      cvr_json.push({'value' : reslt45fr[6], 'group' : "Sat"});


      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "CVR: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv17").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(cvr_json.map(function(d) { return d.group; }));
    y.domain([0, d3.max(cvr_json, function(d) { return d.value; })]);

    dx = width / cvr_json.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "+.4em")
        .attr("dy", "+.36em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar")
        .data(cvr_json)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", function(d, i) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 200 })
        .duration(200)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());

          conversion_tod();
    }

    var impss = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

  query5 = "select count(*) from ica_table where event_type='CO' and dt between ".concat(query_cond," group by attr_time_of_day top 24");
  var pinot_query_conversion_tod = JSON.stringify({"pql":query5});



  function conversion_tod(){
    jQuery.ajax({
  type:"POST",
  url:"http://vqctd-hadoopas5.phx01.ebayadvertising.com:8099/query",
  data:pinot_query_conversion_tod,
  success:onBarChartData_conversion_tod
  }
  );
  }


  function onBarChartData_conversion_tod(data){
    var myarr = JSON.parse(data).aggregationResults[0].groupByResult;
       //document.getElementById("myDiv5").innerHTML=data;
    
      myarr.forEach(function(d){
    d.value = +d.value;
    d.group = +d.group;
  });

      for (var i=0; i<myarr.length; i++)
      {
        impss.splice(myarr[i].group, 1, myarr[i].value);
      }
      cvr_result();
  }

  function cvr_result(){

       var cvr2 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
       //clicks.splice(0, 2);

       for (var i=0; i<impressions.length; i++)
      {
          var res2343 = (impss[i]/impressions[i])*100;
          cvr2.splice(i, 1, res2343);
      }

      var cvr_rst_json = [];
       for (var i=0; i<cvr2.length; i++)
      {
        cvr_rst_json.push({'value' : cvr2[i], 'group' : i.toString()});
      }

      var margin = {top: 50, right: 20, bottom: 70, left: 40},
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-25, 0])
    .html(function(d) {
      return "CVR: <span style='color:red'>" + d.value + "</span>";
    })


  var x = d3.scale.ordinal().rangeRoundBands([0, width], .09);

  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom") ;

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#myDiv18").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      svg.call(tip);
   
    x.domain(cvr_rst_json.map(function(d) { return d.group; }));
    y.domain([0, d3.max(cvr_rst_json, function(d) { return d.value; })]);

    dx = width / cvr_rst_json.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "+.5em")
        .attr("dy", "+.36em")
        .attr("transform", "rotate(-90)" );

    svg.selectAll(".x text")  // select all the text elements for the x
            .attr("transform", function(d) {
               return "translate(" + this.getBBox().width + "," + this.getBBox().height + ")rotate(0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");  

    svg.selectAll("bar3")
        .data(cvr_rst_json)
        .enter().append("rect")
        .attr("class", "bar3")
        .attr("y", function(d, i) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .delay(function(d, i) { return i * 200 })
        .duration(200)
        .attr("x", function(d, i) { return x(d.group); })
        .attr("width", x.rangeBand());
  }
}