//Total,341410,376540,437430,501350,519760,437920,431770,467330,482090,464670,465260,489280,540140,527450,550350,506810,145970,394890
function initializeMap(){ // initialize the choropleth
    var w = 600;
    var h = 400;

    var svg = d3.select("#geomap")
                .append("svg")
                .attr("width",w)
                .attr("height",h)
                .attr("viewBox", [0, 0, w, h])
                .call(d3.zoom().on("zoom", function () {
                    svg.attr("transform", d3.zoomTransform(this))
                  }))
                .attr("fill","grey");
    g = svg.append("g");
   
    drawMap("2021","arrive", true);
}  

function drawMap(year,type,initialize = false) //update the choropleth
{   
    
    var w = 700;
    var h = 500;
    var projection = d3.geoMercator() //geoMercator projection
                    .center([145,-36.5])
                    .translate([w/2 + 100,h/2+100]) // move to the center
                    .scale(600);
    var path = d3.geoPath()
                .projection(projection); //project 
    var svg = d3.select("#geomap").select("g"); 
    
    d3.csv(`../data/state_${type}.csv`).then(function(data){ //combine data from csv with json
        data.forEach(function(d) {
            d.State = d.State;
            for(var i = 2004; i <=2021; i++ )
            {
                d[`${i}`] = parseInt( d[`${i}`]);
            }
            
        });
        
        var color = d3.scaleLinear()
                .domain([100,150000])
                .range(d3.schemeBlues[3]);

        console.log(d3.min(data, function(d){return d[year]}),d3.max(data, function(d){return d[year]}))
        d3.json("https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson").then(function(json){ //use json to to get coordinates of the map
//.properties.STATE_NAME
            
            for(var i =0; i <data.length; i++)
            {
                var dataLoc = data[i].State;
                var dataValue = data[i][year];
                for(var j =0; j < json.features.length; j++)
                {
                    var jsonLoc = json.features[j].properties.STATE_NAME;
                    if(dataLoc == jsonLoc) // if location matches the json
                    {
                        json.features[j].properties.value = dataValue; //append value into json based on the location
                        
                        break;
                    }
                }
            }
            if(initialize) // if initialise then create the path
            {
                map = svg.selectAll("path")
                .data(json.features)
                .enter()
                    .append("path")
                    .attr("d", path)
                    .style("stroke-width", ".3")
                    .style("stroke", "black")
                    .attr("class", function(d){ return "state" } )

                    .attr("fill", (d)=>{
                        
                        var value = d.properties.value;
                        return color(value);
                    })
                    .append("title").text((d) => {
                        var temp
                        if(type == "arrive"){
                            temp = "Arrival";
                        }
                        else if(type == "departure")
                        {
                            temp = "Departure";
                        }
                       return `State: ${d.properties.STATE_NAME}\n${temp}: ${d.properties.value}`
                       
                    });
            }
            { //just select the path
                map = svg.selectAll("path")
                        .data(json.features)
                        .transition()
                        .ease(d3.easePoly)
                        .duration(1000)
                        .attr("fill", (d)=>{
                            
                            var value = d.properties.value;
                            console.log(color(value));
                            return color(value);
                        });
                svg.selectAll("title")
                    .data(json.features)
                    .text((d) => {
                        var temp;
                        if(type == "arrive"){
                            temp = "Arrival";
                        }
                        else if(type == "departure")
                        {
                            temp = "Departure";
                            console.log(temp);
                        }
                       
                       return `State: ${d.properties.STATE_NAME}\n${temp}: ${d.properties.value}`
                       
                    });
                        
            }
            svg.selectAll("path")
                .data(json.features)
                .on("mouseover",function(event,d){
                    d3.selectAll(".state")
                          .transition()
                          .duration(200)
                          .style("stroke-width", "0.1")
                          .style("opacity", .5);
                    d3.select(this)
                          .transition()
                          .duration(200)
                          .style("opacity", 1.4)
                          .style("stroke-width", "1")
                          .style("stroke", "black");
                })
                .on("mouseleave", function(){
                    d3.selectAll(".state")
                        .transition()
                        .duration(500)
                        .style("opacity", 2.)
                        .style("stroke-width", ".2")
                        .style("stroke", "black")
                })

              
    })
    })
}
