function initiliazeLine(){
    //var w = document.querySelector('.linechart').offsetWidth;
    var w = 600;
    var h = 400;
    var padding = 60;
    var svg = d3.select(".linechart")
                .append("svg")
                .attr("width",w +400)
                .attr("height",h + padding )
                .attr("fill","grey")
                .append("g")
              .attr("transform",`translate(${60},${10})`);;
    drawLine("Australia","Arrival",true);
}

function drawLine(state,type,initialize = false)
{
    var w = 600+100;
    var h = 400;
    var padding = 60; //padding
    var svg = d3.select(".linechart").select("svg g"); 
    color = d3.scaleOrdinal(d3.schemeCategory10);
    xScale = d3.scaleTime() 
                .domain([2004,2021])
                .range([0,w]);

    yScale = d3.scaleLinear()
               // .domain([0,d3.max(dataset,function(d) {return d.number; })]) //range from 0 to maximum value of the dataset
                .range([h,0]);

    title = document.querySelector(".title-line")
    
    if(type == "Arrival"){
        title.innerText = `Total Arrival to ${state} from 2004 to 2021`;
    }
    else{
        title.innerText = `Total Departure from ${state} from 2004 to 2021`;
    }
    d3.csv(`./datasets/visa/${state}.csv`).then(function(data){
        data.forEach(function(d) {
            d.type = d.type;
            for(var i = 2004; i <=2021; i++ )
            {
                d[`${i}`] = parseInt( d[`${i}`]);
            } 
        });
        console.log(data)
        var dataset = [];
        key= [];
        for(var i =0; i < data.length; i++){
            var temp = Object.entries(data[i])
            var dict = {};
            var lst_small = [];
            var temp_small = temp.slice(0,18);
            for(let j=0; j<18;j++){
                var dict_small ={}
                dict_small["year"]= temp_small[j][0];
                dict_small["value"] = temp_small[j][1];
                lst_small.push(dict_small)
            }
            key.push(temp[18][1]);
            dict["key"] = temp[18][1];
            dict["values"] = lst_small;
            dataset.push(dict);
        }
        console.log(dataset)
        console.log(max(data))

        yScale.domain([0,max(data)+10000]);
        color.domain(key);
        line = d3.line()
                .x(function(d,i) {return xScale(d.year); }) // add padding to the x-coord to push it to the right
                .y(function(d) {return yScale(d.value); });
        var xAxis = d3.axisBottom().tickFormat(d3.format("d")).ticks(5).scale(xScale); // number of ticks on the axis
        var yAxis = d3.axisLeft(yScale).ticks(10, "s").tickSize(-w ); // number of ticks on the axis

        svg.selectAll(".line")
        .data(dataset)
        .enter()
        .append("path")
        .attr("class","line-path")
          .attr("fill", "none")
          .attr("stroke", function(d,i){return color(d.key); })
          .attr("stroke-width", 2)
          .attr("d", function(d,i){
            
            return d3.line()
              .x(function(d) { return xScale(d.year); })
              .y(function(d) { return yScale(d.value); })
              .curve(d3.curveCatmullRom)
              (d.values)
          });
    
        svg.append("g")
          .attr("class", "xAxis")
          .attr("transform",`translate(${0},${h})`)
          .call(xAxis);
          var axisPad = 6 
        svg.append("g")
          .attr("class", "y axis")
         .attr("transform",`translate(${0},0)`)
          .call(yAxis)
          .call(g => {
            g.selectAll("text")
            .style("text-anchor", "middle")
            .attr("x", -axisPad*2)
            .attr('fill', '#A9A9A9')

            g.selectAll("line")
              .attr('stroke', '#A9A9A9')
              .attr('stroke-width', 1) // make horizontal tick thinner and lighter so that line paths can stand out
              .attr('opacity', 0.5)

            g.select(".domain").remove()
           })
           .append('text')
            .attr('x', 0)
            .attr("y", 20)
            .attr("fill", "#A9A9A9")
            .text("People")

        var R =6;
        var svgLegend = svg.append('g')
            .attr('class', 'gLegend')
            .attr("transform", "translate(" + (w + 150) + "," + 0 + ")")

        var legend = svgLegend.selectAll('.legend')
          .data(key)
          .enter().append('g')
            .attr("class", "legend")
            .attr("transform", function (d, i) {return "translate(0," + i * 20 + ")"})

        legend.append("circle")
            .attr("class", "legend-node")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", R)
            .style("fill", d=>color(d))

        legend.append("text")
            .attr("class", "legend-text")
            .attr("x", R*2)
            .attr("y", R/2)
            .style("font-size", 12)
            .text(d=>d);
        lineStroke = 1.5;
        mouseG = d3.select(".linechart").select("svg").append("g")
            .attr("class", "mouse-over-effects");

        tooltip = d3.select(".linechart").append("div")
                    .attr('id', 'tooltip')
                    .style('position', 'absolute')
                    .style("background-color", "#D3D3D3")
                    .style('padding', 6)
                    .style('display', 'none');

        
        
        mouseG.append("path") // create vertical line to follow mouse
                .attr("class", "mouse-line")
                .style("stroke", "#A9A9A9")
                .style("stroke-width", 1.5)
                .style("opacity", "0");

        var mousePerLine = mouseG.selectAll('.mouse-per-line')
                                .data(dataset)
                                .enter()
                                .append("g")
                                .attr("class", "mouse-per-line");
        
        mousePerLine.append("circle")
                    .attr("r", 4)
                    .style("stroke", function (d,i) {
                        return color(d.key)
                    })
                    .style("fill", "none")
                    .style("stroke-width", lineStroke)
                    .style("opacity", "0");

        mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
                .attr('width', w+100) 
                .attr('height', h+10)
                .attr('fill', 'none')
                .attr('pointer-events', 'all')
                .on('mouseout', function () { // on mouse out hide line, circles and text
                    d3.select(".mouse-line")
                    .style("opacity", "0");
                    d3.selectAll(".mouse-per-line circle")
                    .style("opacity", "0");
                    d3.selectAll(".mouse-per-line text")
                    .style("opacity", "0");
                    d3.selectAll("#tooltip")
                    .style('display', 'none')

                })
                .on('mouseover', function () { // on mouse in show line, circles and text
                    d3.select(".mouse-line")
                    .style("opacity", "1");
                    d3.selectAll(".mouse-per-line circle")
                    .style("opacity", "1");
                    d3.selectAll("#tooltip")
                    .style('display', 'block')
                })
                .on('mousemove', function (event) { // update tooltip content, line, circles and text when mouse moves
                    var xDate, bisect,idx;
                    var mouse =  d3.pointer(event,this)
                    if(mouse[0]>60)
                    {
                        d3.selectAll(".mouse-per-line")
                          .attr("transform", function (d, i) {
                            var temp = mouse[0] -60;
                            xDate = xScale.invert(temp) // use 'invert' to get date corresponding to distance from mouse position relative to svg
                            bisect = d3.bisector(function (d) { return d.year; }).left // retrieve row index of date on parsed csv
                            idx = bisect(d.values, xDate);
                            d3.select(".mouse-line")
                              .attr("d", function () {
                                // console.log(d.values[idx].year)
                                var data = "M" + (xScale(d.values[idx].year)+60) + "," + (h);
                                data += " " + (xScale(d.values[idx].year)+60) + "," + 0;
                                return data;
                              });
                            return "translate(" + (xScale(d.values[idx].year)+60) + "," + (yScale(d.values[idx].value)+10) + ")";
          
                          });
                    }
                   
      
                    //updateTooltipContent(mouse, dataset)
                    sortingObj = []
                    dataset.map(d => {
                    //   var xDate = xScale.invert(mouse[0])
                    //   var bisect = d3.bisector(function (d) { return d.date; }).left
                    //   var idx = bisect(d.values, xDate)
                      sortingObj.push({ key: d.key, year: d.values[idx].year, value: d.values[idx].value})
                    })
                
                    sortingObj.sort(function(x, y){
                       return d3.descending(x.value, y.value);
                    })
                    var sortingArr = sortingObj.map(d=> d.key)

                    var res_nested1 = dataset.slice().sort(function(a, b){
                      return sortingArr.indexOf(a.key) - sortingArr.indexOf(b.key) // rank vehicle category based on price of premium
                    })
                    console.log(sortingObj)
                    tooltip.html(sortingObj[0].year)
                            .style('display', 'block')
                            .style('left', event.pageX + 20)
                            .style('top', event.pageY - 20)
                            .style('font-size', 11.5)
                            .selectAll()
                            .data(res_nested1).enter() // for each vehicle category, list out name and price of premium
                            .append('div')
                            .style('color', d => {
                                return color(d.key)
                            })
                            .style('font-size', 10)
                            .html(d => {
                               
                                return d.key + ": " + d.values[idx].value.toString()
                            })
      
                  })
       
    })
}

function updateTooltipContent(mouse, res_nested) {
    console.log(idx)
    sortingObj = []
    res_nested.map(d => {
      var xDate = xScale.invert(mouse[0])
      var bisect = d3.bisector(function (d) { return d.date; }).left
      var idx = bisect(d.values, xDate)
      sortingObj.push({ key: d.key, year: d.values[idx].year, value: d.values[idx].value})
    })

    sortingObj.sort(function(x, y){
       return d3.descending(x.value, y.value);
    })

    var sortingArr = sortingObj.map(d=> d.key)

    var res_nested1 = res_nested.slice().sort(function(a, b){
      return sortingArr.indexOf(a.key) - sortingArr.indexOf(b.key) // rank vehicle category based on price of premium
    })

    tooltip.html(sortingObj[0].month + "-" + sortingObj[0].year + " (Bidding No:" + sortingObj[0].bidding_no + ')')
      .style('display', 'block')
      .style('left', d3.event.pageX + 20)
      .style('top', d3.event.pageY - 20)
      .style('font-size', 11.5)
      .selectAll()
      .data(res_nested1).enter() // for each vehicle category, list out name and price of premium
      .append('div')
      .style('color', d => {
        return color(d.key)
      })
      .style('font-size', 10)
      .html(d => {
        var xDate = xScale.invert(mouse[0])
        var bisect = d3.bisector(function (d) { return d.date; }).left
        var idx = bisect(d.values, xDate)
        return d.key.substring(0, 3) + " " + d.key.slice(-1) + ": $" + d.values[idx].premium.toString()
      })
  }


function max(data)
{
    var temp =0;
    for(let i=0; i< data.length; i++)
    {
        var temp1 = data[i];
    
        for(var j = 2004; j <=2021; j++ )
        {
           
            if(parseInt(temp1[`${j}`])> temp)
            {
                temp = parseInt(temp1[`${j}`]);
            }
       }
    }
    return temp;

}