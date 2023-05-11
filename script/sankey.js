function initialiseSankey()
{
    var w = 600;
    var h = 400;
    var padding = 60;
    var svg = d3.select(".barChart")
                .append("svg")
                .attr("width",w +100)
                .attr("height",h + padding )
                .attr("fill","grey");
    drawSankey("Australia",true);
}
function drawSankey(initialise = false)
{
    
}