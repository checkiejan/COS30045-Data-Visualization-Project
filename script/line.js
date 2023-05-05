function initiliazeLine(){
    //var w = document.querySelector('.linechart').offsetWidth;
    var w = 600;
    var h = 400;
    var padding = 60;
    var svg = d3.select(".linechart")
                .append("svg")
                .attr("width",w +100)
                .attr("height",h + padding )
                .attr("fill","grey");
    drawLine("Australia","Arrival",true);
}

function drawLine(state,type,initialize = false)
{
    var w = 600;
    var h = 400;
    var padding = 60; //padding
    var svg = d3.select(".linechart").select("svg"); 
    xScale = d3.scaleTime() 
                .domain([2004,2021])
                .range([0,w]);

    yScale = d3.scaleLinear()
               // .domain([0,d3.max(dataset,function(d) {return d.number; })]) //range from 0 to maximum value of the dataset
                .range([h,0]);

    title = document.querySelector(".title-line")
    
    if(type == "Arrival"){
        title.innerText = `Total Arrival to ${state} in 2021`;
    }
    else{
        title.innerText = `Total Departure from ${state} in 2021`;
    }
    d3.csv(`./data/state_${type.toLowerCase()}.csv`).then(function(data){
        data.forEach(function(d) {
            d.State = d.State;
            for(var i = 2004; i <=2021; i++ )
            {
                d[`${i}`] = parseInt( d[`${i}`]);
            } 
        });

        var temp;
        for(var i =0; i < data.length; i++){
            if(data[i]["State"] == state){
                temp = data[i];
            }
        }
        var result = [];
        for (const [key, value] of Object.entries(temp)) {
            if(typeof value == 'number'){
                result.push(value);
            }
        }
        dataset = Object.entries(temp).slice(0,18);
        yScale.domain([0,d3.max(result,function(d) {return d;})])
        line = d3.line()
                .x(function(d) {return xScale(d[0]) + padding; }) // add padding to the x-coord to push it to the right
                .y(function(d) {return yScale(d[1]); });
        var xAxis = d3.axisBottom().tickFormat(d3.format("d")).ticks(5).scale(xScale); // number of ticks on the axis


        var yAxis = d3.axisLeft().ticks(6).scale(yScale); // number of ticks on the axis
       
        if(initialize){
            svg.append("path")
                .datum(dataset)
                .attr("class", "line-path")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", line)
            svg.append("g")
                .attr("class", "xAxis")
                .attr("transform",`translate(${padding},${h +20})`)
                .call(xAxis);
 
            svg.append("g")
            .attr("class", "yAxis")
                .attr("transform",`translate(${padding},20)`)
                .call(yAxis);
        }
        else{
            svg.selectAll(".line-path")
                .datum(dataset)
                .transition()
                .ease(d3.easePoly)
                .duration(1000)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", line)
            // svg.select(".xAxis").remove()
            // svg.select(".yAxis").remove()
            svg.select(".xAxis")
                .transition()
                .ease(d3.easePoly)
                .duration(1000)
                .call(xAxis);
 
            svg.select(".yAxis")
                .transition()
                .ease(d3.easePoly)
                .duration(1000)
                .call(yAxis);

           
        }
       
    })
}