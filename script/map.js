var w = 600;
var h = 400;

function initializeMap(){ // initialize the choropleth
    var zoom = d3.zoom().scaleExtent([1, 2]) //limite the maximum rate can be zoommed
            .translateExtent([[-600, -500], [1200, 1200]]).on('zoom', handleZoom); //limit the range can be draged
    function handleZoom(e) { //function to handle zoom
        d3.select('.map svg .t')
            .attr('transform', e.transform);
        
    }       
    
    var svg = d3.select(".map") //make a new svg element
                .append("svg")
                .attr("width",w)
                .attr("height",h+100)
                .append("g") .attr("class","t")
                .attr("transform", 
                        `translate(${0},${0})`)
                .attr("viewBox", [0, 0, w , h])
                .call(zoom)
                .attr("fill","grey");
   
    
    svg.on("mouseleave", function(){ //when mouse leave the map, reset to normal zoom
              d3.select('.map svg .t')
                .transition()
                .duration(700)   
                .call(zoom.transform, d3.zoomIdentity .translate(w/2 -140, h/2 -150) .scale(1).translate(-145,-36.5)); 
            }) 
    drawMap("2021","Arrival", true);
}  

function drawMap(year,type,initialize = false) //update the choropleth
{   
    
    var projection = d3.geoMercator() //geoMercator projection
                    .center([145,-36.5])
                    .translate([w/2  + 125,h/2 + 75]) // move to the center
                    .scale(500);
    var path = d3.geoPath()
                .projection(projection); //project 
    var svg = d3.select(".map").select("svg").select(".t"); 
    
    d3.csv(`./datasets/state_${type.toLowerCase()}.csv`).then(function(data){ //combine data from csv with json
        data.forEach(function(d) {
            d.State = d.State;
            for(var i = 2004; i <=2021; i++ )
            {
                d[`${i}`] = parseInt( d[`${i}`]);
            }
            
        });
        
        var color = d3.scaleLinear()
                .domain([2000,10000,30000,50000,70000,100000,150000,200000])
                .range(d3.schemeBlues[7]);

       
        d3.json("https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson").then(function(json){ //use json to to get coordinates of the map

            
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
                createColorScale(color,h); //create color scale legend
                map = svg.selectAll("path") //create path for each state
                        .data(json.features)
                        .enter()
                            .append("path")
                            .attr("d", path)
                            .style("stroke-width", ".3")
                            .style("stroke", "black")
                            .style("opacity", 1.5)
                            .attr("class", function(d){ return "state" } )

                            .attr("fill", (d)=>{
                                
                                var value = d.properties.value;
                                return color(value);
                            })
                            .append("title").text((d) => {
                            return `State: ${d.properties.STATE_NAME}\n${type}: ${d.properties.value}`
                            
                            });
            }
            { //update the map when there is something changed
                map = svg.selectAll("path")//just select the path
                        .data(json.features)
                        .transition()
                        .ease(d3.easePoly)
                        .duration(1000)
                        .style("opacity", 1.5)
                        .attr("fill", (d)=>{
                            
                            var value = d.properties.value;
                           
                            return color(value);
                        });
                svg.selectAll("title")
                    .data(json.features)
                    .text((d) => {
                       return `State: ${d.properties.STATE_NAME}\n${type}: ${d.properties.value}`
                    });
                        
            }
            svg.selectAll("path")
                .data(json.features)
                .on("mouseover",function(event,d){ //update the hover effect
                   focus(this);  //hover for a state no matter if there is a clicked state                
                })
                .on("mouseleave", function(){
                    if( !d3.select(this).classed("clicked") &&  !svg.classed("clicked-svg")) // if there is not a state that has been clicked
                    {
                        defocus(); //defocus for the whole map
                    }
                    if(!d3.select(this).classed("clicked") &&  svg.classed("clicked-svg")) //if there is a state that has been been clicked to focus
                    {
                        var object= d3.select(".state .clicked");
                        focus(".clicked"); //keep focus for that state
                    }
                })
                .on("click", function(event,d){
                    if(!d3.select(this).classed("clicked")) //if the state has not been cliked before
                    {
                        svg.classed("clicked-svg",true) //save the clicked state into svg
                        d3.selectAll(".state").classed("clicked",false) //defocus all other state first
                        d3.select(this).classed("clicked",true); //focus for the chosen setate
                        focus(this);
                        updateBar(d.properties.STATE_NAME); //update the bar chart
                    }
                    else{
                        svg.classed("clicked-svg",false)
                        d3.select(this).classed("clicked",false);
                        defocus(); //defocus for the whole map
                        updateBar("Australia"); //draw the bars for the whole Australia
                    }
                })
    })
    })
}

function createColorScale(color,h) //color legend for the choropleth
{
    var svg = d3.select(".map")
                .select("svg");

    svg.append("rect") //append a rect
        .attr("id", "colorScale")
        .attr("x", 20)
        .attr("y", h )
        .attr("width", 200)
        .attr("height", 20)
        .attr("style", "outline: thin solid black;");

    var defs = svg.append("defs");
    var linearGradient = defs.append("linearGradient").attr("id", "linear-gradient-map"); //linear-gradient definition

    linearGradient.selectAll(".stop")
                .data(color.range())
                .enter()
                .append("stop")
                .attr("offset", (d, i) => i / (color.range().length ))
                .attr("stop-color", d => d);

    svg.select("#colorScale")
        .style("opacity", 1.5)
        .style("fill", "url(#linear-gradient-map)"); //apply gradient to the rect

    svg.append("text").text("2,000").attr("x", 20).attr("y", h - 7);
    svg.append("text").text("200,000").attr("x", 160).attr("y", h - 7);

}

function focus(object){ //focus for a specific state
    d3.selectAll(".state") //make all other states blur
        .transition()
        .duration(200)
        .style("stroke-width", "0.1")
        .style("opacity", 0.5);
    d3.select(object) //make the focused not more outstanding
        .transition()
        .duration(200)
        .style("opacity", 2)
        .style("stroke-width", "1.5")
        .style("stroke", "black");
}

function defocus(){ //set every state back to normal
    d3.selectAll(".state")
        .transition()
        .duration(500)
        .style("opacity", 1.5)
        .style("stroke-width", ".2")
        .style("stroke", "black");
}