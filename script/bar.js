const color_arrive = "#2FC4B2";
const color_depart = "#E14D2A";
var formatNumber = d3.format(",.0f") // zero decimal places
var format = function(d) { return formatNumber(d); };
var w = 600;
var h = 400;
var padding = 70; 
function focusBar() //to make a bar look outstanding
{
    var year = parseInt(document.querySelector("#year").value);
    var index = year -2004; //get the order of the bar
    console.log(index);
    d3.selectAll(".barchart svg rect") //delete all style for other bars
        .attr("style",null);
    d3.selectAll(".barchart svg .depart") //focus on the needed bar
                .transition()
                .duration(500)
                .attr("style", function(d,i){
                if(i==index)
                {
                    return "outline: medium solid black;";
                }
            });
    d3.selectAll(".barchart svg .arrive") //focus on the needed bar
            .transition()
            .duration(500)
            .attr("style", function(d,i){
            if(i==index)
            {
                return "outline: medium solid black;";
            }
        });
}
function initialiseBar()
{
    var svg = d3.select(".barChart")
                .append("svg")
                .attr("width",w +100)
                .attr("height",h + padding )
                .attr("fill","grey");
    
    drawBar("Australia");
    
}
function drawBar(state)
{
  
    var svg = d3.select(".barchart").select("svg"); 

    title = document.querySelector(".title-bar")
    
    
    title.innerText = `Arrival and Departure to ${state} from 2004 to 2021`;


    var xScale = d3.scaleBand() //xscale for the bar chart
        .domain(d3.range(2004,2022))
        .rangeRound([0,w])
        .paddingInner(0.2); //add padding
    var yScale = d3.scaleLinear() // yscale for the bar chart
        .range([0,h/3]);
      
    var xAxis = d3.axisBottom().tickFormat(d3.format("d")).ticks(3).scale(xScale); // number of ticks on the axis
    
    

    d3.csv("./datasets/state_arrival.csv").then(function(arrival){
        arrival.forEach(function(d) { // parse integer from the data
            d.State = d.State;
            for(var i = 2004; i <=2021; i++ )
            {
                d[`${i}`] = parseInt( d[`${i}`]);
            }
            
        });
        d3.csv("./datasets/state_departure.csv").then(function(departure){ //merge 2 files
            departure.forEach(function(d) { // parse integer from the data
                d.State = d.State;
                for(var i = 2004; i <=2021; i++ )
                {
                    d[`${i}`] = parseInt( d[`${i}`]);
                }
                
            });
            
           
            var arrive =  extractState(state, arrival);

            var depart =  extractState(state, departure);
            yScale.domain([0,d3.max(arrive,function(d) {return d;})]); 
     
            var max = d3.max(arrive,function(d) {return d;});
            var lst = [] //list to store the ticks of y-axis
            for(let i =-2; i <=4; i++){
               
                lst.push(Math.round((max/4)*i)); //push to make line grid
                
                svg.append("line") // line element
                    .attr("class","line ")
                    .attr("x1",padding)
                    .attr("y1", h - yScale((max/4)*i) -h/2 )
                    .attr("x2",w + padding) // push to the right
                    .attr("y2", h - yScale((max/4)*i) -h/2 )
                    .attr('stroke', '#A9A9A9')
                    .attr('stroke-width', 1) // make horizontal tick thinner and lighter so that line paths can stand out
                    .attr('opacity', 0.5);
            }

            svg.selectAll("text")//append tick for y-axis
                .data(lst)
                .enter()
                .append("text")
                .attr("x", 75)
                .attr("y", function(d){
                    return h - yScale(d) -h/2 ;
                })
                .attr("text-anchor", "end")
                .text((d)=>{
                    return format(d);
                })

            svg.selectAll("rect") //bind bars to data
                .data(arrive)
                .enter()
                .append("rect")
                .attr("class", "arrive")
                .append("title").text((d,i) => {
                    return `Year: ${2004+i}\nArrival: ${d}`;
                });
             
            svg.selectAll("rect") //give attribute for arrive bar
                .attr("x", function(d,i){
                    return xScale(i+2004) + padding;
                })
                .attr("y", function(d){
                    return h -yScale(d) -h/2;
                })
                .attr("fill",color_arrive)
                .attr("width", xScale.bandwidth())
                .attr("height", function(d){
                    return yScale(d);
                });
                

            for(let i =0 ; i< depart.length; i++){ //use the for loop because already have the rect element
                var rect = svg.append("rect")
                            .attr("class", "depart");
                rect.append("title").text(() => {
                    return `Year: ${2004+i}\nDeparture: ${depart[i]}`;
                    });
    
                rect.attr("x", function(){
                    return xScale(i+2004) + padding;
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
           
            svg.append("rect") //legend for arrive color
                .attr("class","legend-arrive")
                .attr("x", 20)
                .attr("y", h -30)
                .attr("width",20)
                .attr("height",20)
                .attr("fill",color_arrive);

            svg.append("text") //text legende for arrive
                .attr("x", 44)
                .attr("y", h-15)
                .attr("font-weight",500)
                .text("Arrival");


            svg.append("rect") //legend for depart color
                .attr("class","legend-depart")
                .attr("x", 110)
                .attr("y", h -30)
                .attr("width",20)
                .attr("height",20)
                .attr("fill",color_depart);

           
            svg.append("text") //text legende for depart
                .attr("x", 134)
                .attr("y", h-15)
                .attr("font-weight",500)
                .text("Departure");

            svg.append('text') //text for axis label
                .attr('x', 0)
                .attr("y", 30)
                .text("Immigrants");
    
            svg.append("g") //append x-axis
            .attr("class", "xAxis")
            .attr("transform",`translate(${padding},${h-100})`)
            .call(xAxis);

            focusBar();
        }
       
        )
    })
}

function updateBar(state)
{
    var svg = d3.select(".barchart").select("svg"); 

    title = document.querySelector(".title-bar")
    title.innerText = `Arrival and Departure to ${state} from 2004 to 2021`;

    var xScale = d3.scaleBand() //xscale for the bar chart
        .domain(d3.range(2004,2022))
        .rangeRound([0,w])
        .paddingInner(0.2); //add padding
    var yScale = d3.scaleLinear() // yscale for the bar chart
        .range([0,h/3]);
    

    d3.csv("./datasets/state_arrival.csv").then(function(arrival){
        arrival.forEach(function(d) { // parse integer from the data
            d.State = d.State;
            for(var i = 2004; i <=2021; i++ )
            {
                d[`${i}`] = parseInt( d[`${i}`]);
            }
            
        });
        d3.csv("./datasets/state_departure.csv").then(function(departure){ //merge 2 files
            departure.forEach(function(d) { // parse integer from the data
                d.State = d.State;
                for(var i = 2004; i <=2021; i++ )
                {
                    d[`${i}`] = parseInt( d[`${i}`]);
                }
                
            });
            
           
            var arrive =  extractState(state, arrival);
            var depart =  extractState(state, departure);

            yScale.domain([0,d3.max(arrive,function(d) {return d;})]); 

            var max = d3.max(arrive,function(d) {return d;});
            var lst = [] //list to store the ticks of y-axis
            for(let i =-2; i <=4; i++){
               
                    lst.push((max/4)*i); //make 6 ticks for the y-axis
            }
            svg.selectAll("text") //append tick for the y-axis
                .data(lst)
                .transition()
                .ease(d3.easePoly)
                .duration(1000)
                .attr("x",75)
                .attr("text-anchor", "end")
                .attr("y", function(d){
                    return h - yScale(d) -h/2 ;
                })
                
                .text((d)=>{
                    return format(d);
                })
            
            svg.selectAll("rect") //update arrive bars
                .data(arrive)
                .transition()
                .ease(d3.easePoly)
                .duration(1000)
                .attr("x", function(d,i){
                    return xScale(i+2004) + padding;
                })
                .attr("y", function(d){
                    return h -yScale(d) -h/2;
                })
                .attr("fill",color_arrive)
                .attr("width", xScale.bandwidth())
                .attr("height", function(d){
                    return yScale(d);
                })
            svg.selectAll(".arrive title") //update arrive title
                .data(arrive)
                .text((d,i) => {
                    console.log(d);
                    return `Year: ${2004+i}\nArrival: ${d}`;
                });
            

            svg.selectAll(".depart") //update depart bars
                .data(depart)
                .transition()
                .ease(d3.easePoly)
                .duration(1000)
                .attr("x", function(d,i){
                    return xScale(i+2004) + padding;
                })
                .attr("y", function(d){
                    return h/2;
                })
                .attr("fill",color_depart)
                .attr("width", xScale.bandwidth())
                .attr("height", function(d){
                    return yScale(d);
                })

            svg.selectAll(".depart title") //update depart title
                .data(depart)
                .text((d,i) => {
                    return `Year: ${2004+i}\nDeparture: ${d}`;
                });
           
        }
        )
    })
    
}
function extractState(state, data) //extract data based on a state
{
    var temp;
    for(var i =0; i < data.length; i++){ //extract value based on state from data from the arrival file
        if(data[i]["State"] == state){
            temp = data[i];
        }
    } 
    var result = []; //use a list to store the data
    for (const [key, value] of Object.entries(temp)) {
        if(typeof value == 'number'){
            result.push(value);
        }
    }   
    return result;
}

