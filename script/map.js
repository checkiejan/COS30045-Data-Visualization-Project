//Total,341410,376540,437430,501350,519760,437920,431770,467330,482090,464670,465260,489280,540140,527450,550350,506810,145970,394890
function initializeMap(){ // initialize the choropleth
    var w = document.querySelector('.map').offsetWidth;
    w = 600;
    var h = 400;
    var zoom = d3.zoom().scaleExtent([1, 1.4])
            .translateExtent([[-200, -300], [1000, 700]]).on('zoom', handleZoom);
    function handleZoom(e) {
        d3.select('.map svg')
            .attr('transform', e.transform);
        
    }
    function resetZoom() {
        d3.select('.map svg')
                .transition()
                .duration(500)    
                .call(zoom.scaleTo, 1);
        return;
    }
    function centerZoom() {
        d3.select('.map svg')  
        .transition()
        .duration(700)     
        .call(zoom.translateTo, 0.5 * w, 0.5 * h )
        ;
       
       
    }
    var svg = d3.select(".map")
                .append("svg")
                .attr("width",w)
                .attr("height",h)
                .attr("viewBox", [0, 0, w , h])
                .call(zoom)
                .attr("fill","grey");
   
    
    svg.on("mouseleave", function(){
              centerZoom();
            }) 
    drawMap("2021","Arrival", true);
}  

function drawMap(year,type,initialize = false) //update the choropleth
{   
    
    var w = document.querySelector('.map').offsetWidth;
    w = 600;
    var h = 400;
    var projection = d3.geoMercator() //geoMercator projection
                    .center([145,-36.5])
                    .translate([w/2  + 120,h/2 + 70]) // move to the center
                    .scale(500);
    var path = d3.geoPath()
                .projection(projection); //project 
    var svg = d3.select(".map").select("svg"); 
    
    d3.csv(`./datasets/state_${type.toLowerCase()}.csv`).then(function(data){ //combine data from csv with json
        data.forEach(function(d) {
            d.State = d.State;
            for(var i = 2004; i <=2021; i++ )
            {
                d[`${i}`] = parseInt( d[`${i}`]);
            }
            
        });
        
        var color = d3.scaleLinear()
                .domain([100,150000])
                .range(["#F6F1F1","#AFD3E2","19A7CE","146C94"])
                //.range(d3.schemeBlues[5]);

       
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
            { //just select the path
                map = svg.selectAll("path")
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
                .on("mouseover",function(event,d){
                   focus(this);                  
                })
                .on("mouseleave", function(){
                    if( !d3.select(this).classed("clicked") &&  !svg.classed("clicked-svg"))
                    {
                        defocus();
                    }
                    if(!d3.select(this).classed("clicked") &&  svg.classed("clicked-svg"))
                    {
                        var object= d3.select(".state .clicked");
                        focus(".clicked");
                    }
                })
                .on("click", function(event,d){
                    if(!d3.select(this).classed("clicked"))
                    {
                        svg.classed("clicked-svg",true)
                        d3.selectAll(".state").classed("clicked",false)
                        d3.select(this).classed("clicked",true);
                        focus(this);
                        var selectMap = document.querySelector('.select-map').value;
                        drawLine(d.properties.STATE_NAME,type);
                    }
                    else{
                        svg.classed("clicked-svg",false)
                        d3.select(this).classed("clicked",false);
                        defocus();
                        drawLine("Australia",type);
                    }
                })
    })
    })
}

function focus(object){
    d3.selectAll(".state")
        .transition()
        .duration(200)
        .style("stroke-width", "0.1")
        .style("opacity", 0.9);
    d3.select(object)
        .transition()
        .duration(200)
        .style("opacity", 2)
        .style("stroke-width", "1")
        .style("stroke", "black");
}

function defocus(){
    d3.selectAll(".state")
        .transition()
        .duration(500)
        .style("opacity", 1.5)
        .style("stroke-width", ".2")
        .style("stroke", "black");
}