function initialiseSankey()
{
    // var w = 600;
    // var h = 400;
    // var padding = 60;
    // var svg = d3.select(".sankey-chart")
    //             .append("svg")
    //             .attr("width",w +100)
    //             .attr("height",h + padding )
    //             .attr("fill","grey");

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 600 - margin.left - margin.right,
        padding = 100,
        height = 300 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(".sankey-chart").append("svg")
                .attr("width", width + margin.left + margin.right+285)
                .attr("height", height + margin.top + margin.bottom+150)
                .append("g") .attr("class","t")
                .attr("transform", 
                        `translate(${margin.left+100},${margin.right})`);
    drawSankey(1,true);
}
function drawSankey(choice,initialise = false)
{
    var formatNumber = d3.format(",.0f"), // zero decimal places
    format = function(d) { return formatNumber(d); },
    color = d3.scaleOrdinal(d3.schemeCategory10);
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
        var sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(20)
        .size([width , height+100]);
    var svg = d3.select(".sankey-chart svg g");
    var path = sankey.links();
    d3.csv(`datasets/sankey${choice}.csv`).then(function(data) {

        //set up graph in same style as original example but empty
        sankeydata = processData(data);
        graph = sankey(sankeydata);
      
      // add in the links
        var link = svg.append("g").attr("class","link-path")
        .selectAll(".link") 
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", function(d) { return d.width; })
        .style("stroke", function(d) { 
            return "#3C2A21";
        })  
        
        // add the link titles
        link.append("title")
            .text(function(d) {
                    
                    return `${ d.source.name} → ${d.target.name}\n ${format(d.value)}`;
                });
        
        // add in the nodes
        var node = svg.append("g") .attr("class","node-path")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .on('click', function(e,d){
            focusCountry(d.name,choice);
        });
        //.attr("fill","#C4DFDF"); ;
        
        // add the rectangles for the nodes
        node.append("rect")
        .attr("x", function(d) { return d.x0; })
        .attr("y", function(d) { return d.y0; })
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { 
                return d.color = color(d.name.replace(/ .*/, "")); 
            })
        .style("stroke", function(d) { 
            return d3.rgb(d.color).darker(2); 
           
        })
        
        node.append("title")
        .text(function(d) { 
            return d.name + "\n" + format(d.value); });
        
        // add in the title for the nodes
        node.append("text")
        .attr("x", function(d) { return d.x0 +25; })
        .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x0 < width / 2; })
        .attr("x", function(d) { return -95; })
      });
}

function processData(data)
{
    sankeydata = {"nodes" : [], "links" : []};
      
    data.forEach(function (d) {
        sankeydata.nodes.push({ "name": d.source });
        sankeydata.nodes.push({ "name": d.target });
        sankeydata.links.push({ "source": d.source,
                            "target": d.target,
                            "value": +d.value });
        });
    
    // return only the distinct / unique nodes
    sankeydata.nodes = Array.from(
        d3.group(sankeydata.nodes, d => d.name),
        ([value]) => (value)
    );
    
    // loop through each link replacing the text with its index from node
    sankeydata.links.forEach(function (d, i) {
        sankeydata.links[i].source = sankeydata.nodes
        .indexOf(sankeydata.links[i].source);
        sankeydata.links[i].target = sankeydata.nodes
        .indexOf(sankeydata.links[i].target);
    });
    
    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    sankeydata.nodes.forEach(function (d, i) {
        sankeydata.nodes[i] = { "name": d };
    });
    return sankeydata;
}

function sortCountry(data,country)
{
    sankeydata = {"nodes" : [], "links" : []};
    data.forEach(function (d) {
       
        if(d.source == country)
        {
            sankeydata.nodes.push({ "name": d.source });
            sankeydata.nodes.push({ "name": d.target });
            sankeydata.links.push({ "source": d.source,
                                "target": d.target,
                                "value": +d.value });
        }
        else if(d.target == country)
        {
            sankeydata.nodes.push({ "name": d.source });
            sankeydata.nodes.push({ "name": d.target });
            sankeydata.links.push({ "source": d.source,
                                "target": d.target,
                                "value": +d.value });
        }
        });
    
    // return only the distinct / unique nodes
    sankeydata.nodes = Array.from(
        d3.group(sankeydata.nodes, d => d.name),
        ([value]) => (value)
    );
    
    // loop through each link replacing the text with its index from node
    sankeydata.links.forEach(function (d, i) {
        sankeydata.links[i].source = sankeydata.nodes
        .indexOf(sankeydata.links[i].source);
        sankeydata.links[i].target = sankeydata.nodes
        .indexOf(sankeydata.links[i].target);
    });
    
    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    sankeydata.nodes.forEach(function (d, i) {
        sankeydata.nodes[i] = { "name": d };
    });
    return sankeydata;
}

function updateSankey(choice){
    var formatNumber = d3.format(",.0f"), // zero decimal places
    format = function(d) { return formatNumber(d); },
    color = d3.scaleOrdinal(d3.schemeCategory10);
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
        var sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(20)
        .size([width , height+100]);
    var svg = d3.select(".sankey-chart svg g");
    var path = sankey.links();
    d3.csv(`datasets/sankey${choice}.csv`).then(function(data){
        sankeydata = processData(data);
        graph = sankey(sankeydata);
        // add in the links
        var link = svg.selectAll("g .link")
        .data(graph.links)
        .transition()       
        .ease(d3.easePoly)
        .duration(1000)
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", function(d) { return d.width; });  
        
        // add the link titles
        link.selectAll("title")
            .text(function(d) {
                    return `${ d.source.name} → ${d.target.name}\n ${format(d.value)}`;
                });
        
        // add in the nodes
        var node = svg.selectAll("g .node")
        .data(graph.nodes)
        .on('click', function(e,d){
            focusCountry(d.name,choice);
        });
       
        
        // add the rectangles for the nodes
        node.select("rect")
        .transition()
        .ease(d3.easePoly)
        .duration(1000)
        .attr("x", function(d) { return d.x0; })
        .attr("y", function(d) { return d.y0; })
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { 
                return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { 
            return d3.rgb(d.color).darker(2); });
        
        node.select("title")
            .text(function(d) { 
                return d.name + "\n" + format(d.value); });
        
        // add in the title for the nodes
        node.select("text")
        .transition()
        .ease(d3.easePoly)
        .duration(1000)
        .attr("x", function(d) { return d.x0 +25; })
        .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x0 < width / 2; })
        .attr("x", function(d) { return -95; })

    })
}


function focusCountry(country,choice){
    console.log(country)
    var formatNumber = d3.format(",.0f"), // zero decimal places
    format = function(d) { return formatNumber(d); },
    color = d3.scaleOrdinal(d3.schemeCategory10);
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
        var sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(20)
        .size([width , height+100]);
    var svg = d3.select(".sankey-chart svg g");
    var path = sankey.links();
    d3.csv(`datasets/sankey${choice}.csv`).then(function(data){
        sankeydata = sortCountry(data,country);
        graph = sankey(sankeydata);
       
        var link = svg.selectAll("g .link")
        .data(graph.links);
        link.exit() 
            .remove();
          // add in the nodes
        var node = svg.selectAll("g .node")
                        .data(graph.nodes);

        node.exit()
            .remove();

       
        link.transition()
            .ease(d3.easePoly)
            .duration(1000)
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function(d) { return d.width; });  
        
        // add the link titles
        link.select("title")
            .data(graph.links)
            .text(function(d) {
                    return `${ d.source.name} → ${d.target.name}\n ${format(d.value)}`;
                });
        // add the rectangles for the nodes
        node.select("rect")
        .transition()
        .ease(d3.easePoly)
        .duration(1000)
        .attr("x", function(d) { return d.x0; })
        .attr("y", function(d) { return d.y0; })
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { 
                return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { 
            return d3.rgb(d.color).darker(2); });
        
        node.select("title")
            .text(function(d) { 
                return d.name + "\n" + format(d.value); });
        
        // add in the title for the nodes
        node.select("text")
        .transition()
        .ease(d3.easePoly)
        .duration(1000)
        .attr("x", function(d) { return d.x0 +25; })
        .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x0 < width / 2; })
        .attr("x", function(d) { return -95; })
        var node = svg.selectAll("g .node")
                    .data(graph.nodes)
                    .on('click', function(e,d){
                        restore(choice);
                    });
       // add the rectangles for the nodes
    })
}

function restore(choice)
{
    console.log(choice);
    var formatNumber = d3.format(",.0f"), // zero decimal places
    format = function(d) { return formatNumber(d); },
    color = d3.scaleOrdinal(d3.schemeCategory10);
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
        var sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(20)
        .size([width , height+100]);
    var svg = d3.select(".sankey-chart svg .t");
    var path = sankey.links();
    d3.csv(`datasets/sankey${choice}.csv`).then(function(data){
        sankeydata = processData(data);
        graph = sankey(sankeydata);

        linkPath = svg.select(".link-path");
        var link = linkPath.selectAll(".link")
                        .data(graph.links);
        link.enter()
            .append("path")
            .attr("class", "link")
            .merge(link)
            .transition()      
            .ease(d3.easePoly)
            .duration(1000)
            
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function(d) { return d.width; });  

        link.selectAll("title")
            .remove();
        link = linkPath.selectAll(".link")
            .data(graph.links);
        link.append("title")     
            .text(function(d) {
                    
                    return `${ d.source.name} → ${d.target.name}\n ${format(d.value)}`;
                });
        
        nodePath = d3.select(".node-path");
        var node = nodePath.selectAll(".node")
                            .data(graph.nodes);

        node.enter()
            .append("g")
            .attr("class", "node")
            .merge(node);
        
        node.selectAll("rect")
            .remove();
        node.selectAll("text")
            .remove();
        node.selectAll("title")
            .remove();
        node = nodePath.selectAll(".node")
                        .data(graph.nodes)
                        .on('click', function(e,d){
                            focusCountry(d.name,choice);
                        });
       
                        
        
        node.append("rect")
            .transition()
            .ease(d3.easePoly)
            .duration(1000)
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { 
                    return d.color = color(d.name.replace(/ .*/, "")); })
            .style("stroke", function(d) { 
                return d3.rgb(d.color).darker(2); });
        
       
            
        node.append("title")
            .text(function(d) { 
                return d.name + "\n" + format(d.value); });
        
        // add in the title for the nodes
        node.append("text")
            .attr("x", function(d) { return d.x0 +25; })
            .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
            .attr("dy", "0.35em")
            .attr("text-anchor", "start")
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x0 < width / 2; })
            .attr("x", function(d) { return -95; })

    })


}
