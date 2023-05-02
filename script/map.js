function init(){
    function drawMap(year)
    {

    }
    var w = 700;
    var h = 500;
    var projection = d3.geoMercator()
                        .center([145,-36.5])
                        .translate([w/2 + 100,h/2+100]) // move to the center
                        .scale(600);
    var path = d3.geoPath()
                .projection(projection); //project 

    var svg = d3.select("#geomap")
                .append("svg")
                .attr("width",w)
                .attr("height",h)
                .attr("fill","grey");
   
    
   

    d3.csv("../data/state_arrive.csv").then(function(data){
        var color = d3.scaleLinear()
                .domain([d3.min(data, function(d){return d["2004"]}),d3.max(data, function(d){return d["2004"]})])
                .range(d3.schemeBlues[8].reverse())
    
        d3.json("https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson").then(function(json){ //use json to to get coordinates of the map
//.properties.STATE_NAME
            for(var i =0; i <data.length; i++)
            {
                var dataLoc = data[i].State;
                var dataValue = data[i]["2004"];
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
            map = svg.selectAll("path")
                .data(json.features)
                .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("fill", (d)=>{
                        
                        var value = d.properties.value;
                        console.log(d.properties);
                        console.log(color(value));
                        return color(value);
                    
                    
                    });
    })
    })
   
}
window.onload = init;