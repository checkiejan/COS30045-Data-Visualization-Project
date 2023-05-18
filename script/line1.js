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
    var w = 600;
    var h = 400;
    var padding = 60; //padding
    var svg = d3.select(".linechart").select("svg g"); 
    color = d3.scaleOrdinal(d3.schemeCategory10);
    xScale = d3.scaleTime() 
                .domain([2004,2021])
                .range([0,w+100]);

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
            dict[temp[18][1]] = lst_small;
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
        var yAxis = d3.axisLeft(yScale).ticks(10, "s").tickSize(-w -100); // number of ticks on the axis

        svg.selectAll(".line")
        .data(dataset)
        .enter()
        .append("path")
        .attr("class","line-path")
          .attr("fill", "none")
          .attr("stroke", function(d,i){  console.log(d[key[i]]);return color(key[i]); })
          .attr("stroke-width", 2)
          .attr("d", function(d,i){
            
            return d3.line()
             
              .x(function(d) { return xScale(d.year); })
              .y(function(d) { return yScale(d.value); })
              .curve(d3.curveCatmullRom)
              (d[key[i]])
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
            .text(d=>d)
       
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