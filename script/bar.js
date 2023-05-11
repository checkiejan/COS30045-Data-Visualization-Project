function initialiseBar()
{
    var w = 600;
    var h = 400;
    var padding = 60;
    var svg = d3.select(".barChart")
                .append("svg")
                .attr("width",w +100)
                .attr("height",h + padding )
                .attr("fill","grey");
    drawBar("Australia",true);
}
// function Max(data){
//     var arrive = [];
//     for (const [key, value] of Object.entries(data)) {
//         if(typeof value == 'number'){
//             arrive.push(value);
//         }
//     }
//     return d3.max(arrive,function(d) {return d;});
// }
function drawBar(state,initialize = false)
{
    var color_arrive = "#9E4784";
    var color_depart = "red";
    var w = 600;
    var h = 400;
    var padding = 70; //padding
    var svg = d3.select(".barchart").select("svg"); 

    title = document.querySelector(".title-bar")
    
    
        title.innerText = `Arrival and Departure to ${state} from 2004 to 2021`;

    var xScale = d3.scaleBand() //xscale for the bar chart
        .rangeRound([0,w])
        .paddingInner(0.2); //add padding
    var yScale = d3.scaleLinear() // yscale for the bar chart
        .range([0,h/3]);
    if (state !=  "Australia"){
        yScale.domain([0,200000]);
    }
    

    d3.csv("./datasets/state_arrival.csv").then(function(arrival){
        arrival.forEach(function(d) {
            d.State = d.State;
            for(var i = 2004; i <=2021; i++ )
            {
                d[`${i}`] = parseInt( d[`${i}`]);
            }
            
        });
        d3.csv("./datasets/state_departure.csv").then(function(departure){
            departure.forEach(function(d) {
                d.State = d.State;
                for(var i = 2004; i <=2021; i++ )
                {
                    d[`${i}`] = parseInt( d[`${i}`]);
                }
                
            });
            xScale.domain(d3.range(2022-2004));
            
            var temp;
            for(var i =0; i < arrival.length; i++){
                if(arrival[i]["State"] == state){
                    temp = arrival[i];
                }
            }
            var arrive = [];
            for (const [key, value] of Object.entries(temp)) {
                if(typeof value == 'number'){
                    arrive.push(value);
                }
            }   
            for(var i =0; i < arrival.length; i++){
                if(departure[i]["State"] == state){
                    temp = departure[i];
                }
            }

            var depart = [];
            for (const [key, value] of Object.entries(temp)) {
                if(typeof value == 'number'){
                    depart.push(value);
                }
            }   

            yScale.domain([0,d3.max(arrive,function(d) {return d;})]); 
        dataset = Object.entries(temp).slice(0,18);
        if(initialize){
            var max = d3.max(arrive,function(d) {return d;});
            var lst = []
            for(let i =-2; i <=4; i++){
                if(i!=0)
                {
                    lst.push((max/4)*i);
                }
                svg.append("line") // line element
                    .attr("class","line halfMilMark")
                    .attr("x1",padding)
                    .attr("y1", h - yScale((max/4)*i) -h/2 )
                    .attr("x2",w + padding) // push to the right
                    .attr("y2", h - yScale((max/4)*i) -h/2 );
            }
            console.log(lst)
            svg.selectAll("text")
                .data(lst)
                .enter()
                .append("text")
                .attr("x", 0)
                .attr("y", function(d){
                    return h - yScale(d) -h/2 ;
                })
                .text((d)=>{
                    return d;
                })

            svg.selectAll("rect") //append bars to the svg
                .data(arrive)
                .enter()
                .append("rect")
                .attr("class", "arrive")
                .append("title").text((d,i) => {
                    return `Year: ${2004+i}\nArrival: ${d}`;
                });
             
            svg.selectAll("rect")
                .attr("x", function(d,i){
                    return xScale(i) + padding;
                })
                .attr("y", function(d){
                    return h -yScale(d) -h/2;
                })
                .attr("fill",color_arrive)
                .attr("width", xScale.bandwidth())
                .attr("height", function(d){
                    return yScale(d);
                });
                

            console.log(depart); 
            for(let i =0 ; i< depart.length; i++){
                var rect = svg.append("rect")
                            .attr("class", "depart");
                rect.append("title").text(() => {
                    return `Year: ${2004+i}\nDeparture: ${depart[i]}`;
                    });
    
                rect.attr("x", function(){
                    return xScale(i) + padding;
                })
                .attr("y", function(d){
                    return h/2 ;
                })
                .attr("fill",color_depart)
                .attr("width", xScale.bandwidth())
                .attr("height", function(){
                    return yScale(depart[i]);
                });
            }           
           
            svg.append("rect")
                .attr("class","legend-arrive")
                .attr("x", 20)
                .attr("y", h -30)
                .attr("width",20)
                .attr("height",20)
                .attr("fill",color_arrive);

            svg.append("rect")
                .attr("class","legend-depart")
                .attr("x", 110)
                .attr("y", h -30)
                .attr("width",20)
                .attr("height",20)
                .attr("fill",color_depart);

            svg.append("text")
                .attr("x", 44)
                .attr("y", h-15)
                .attr("font-weight",500)
                .text("Arrival");

            svg.append("text")
                .attr("x", 134)
                .attr("y", h-15)
                .attr("font-weight",500)
                .text("Departure");
           
        }
        else{
            // d3.selectAll("line").remove();
            var max = d3.max(arrive,function(d) {return d;});
            var lines  = [-2,-1,0,1,2,3,4] 
            var lst = []
            svg.selectAll(".line") // line element
                .data(lines)
                //.attr("class","line halfMilMark")
                .attr("x1",padding)
                .attr("y1",function(d,i){
                    return h - yScale((max/4) *d) -h/2
                }  )
                .attr("x2",w + padding) // push to the right
                .attr("y2",function(d){
                    return h - yScale((max/4) *d) -h/2
                } );
            for(let i =-2; i <=4; i++){
                if(i == 0){
                    continue;
                }
                    lst.push((max/4)*i);
            }
            console.log(lst)
            svg.selectAll("text")
                .data(lst)
                .transition()
                .ease(d3.easePoly)
                .duration(1000)
                .attr("x", 0)
                .attr("y", function(d){
                    return h - yScale(d) -h/2 ;
                })
                .text((d)=>{
                    return d;
                })
            
            svg.selectAll("rect")
                .data(arrive)
                .transition()
                .ease(d3.easePoly)
                .duration(1000)
                .attr("x", function(d,i){
                    return xScale(i) + padding;
                })
                .attr("y", function(d){
                    return h -yScale(d) -h/2;
                })
                .attr("fill",color_arrive)
                .attr("width", xScale.bandwidth())
                .attr("height", function(d){
                    return yScale(d);
                })
            svg.selectAll(".arrive title")
                .data(arrive)
                .text((d,i) => {
                    console.log(d);
                    return `Year: ${2004+i}\nArrival: ${d}`;
                });
            

            svg.selectAll(".depart")
                .data(depart)
                .transition()
                .ease(d3.easePoly)
                .duration(1000)
                .attr("x", function(d,i){
                    return xScale(i) + padding;
                })
                .attr("y", function(d){
                    return h/2;
                })
                .attr("fill",color_depart)
                .attr("width", xScale.bandwidth())
                .attr("height", function(d){
                    return yScale(d);
                })

            svg.selectAll(".depart title")
                .data(depart)
                .text((d,i) => {
                    return `Year: ${2004+i}\nDeparture: ${d}`;
                });
           
        }
        })
    })
}