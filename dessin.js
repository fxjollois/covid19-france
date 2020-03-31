function nettoyageDessin () {
    d3.select("#graph").html("");
}

function dessinEvolution(donnees, france = true) {
    var xC, xD,
        margin = {top: 30, right: 40, bottom: 30, left: 60},
        ratio = 10 / 5,
        widthTotal = parseInt(d3.select("#graph").style("width").replace("px", "")),
        heightTotal = widthTotal / ratio,
        width = widthTotal - margin.left - margin.right,
        height = heightTotal - margin.top - margin.bottom,
        pad = 20,
        
        couleur_malades = "darkslateblue",
        couleur_deces = "darkred",
        
        svg = d3.select("#graph")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
        
        x = d3.scaleTime()
            .domain(d3.extent(donnees, function (d) { return d.date; }))
            .range([ 0, width ]),
        
        y = d3.scaleLinear()
            .domain([0, d3.max(donnees, function (d) { return +d.confirmes; })])
            .range([ (height / 2) - pad, 0 ]),

        y2 = d3.scaleLinear()
            .domain([0, d3.max(donnees, function (d) { return +d.morts * 1.2; })])
            .range([ height, (height / 2) + pad ]),
        
        etapes = [
            {date: "3/12/20", libelle: "allocution du président" },
            {date: "3/16/20", libelle: "école à la maison" },
            {date: "3/17/20", libelle: "début du confinement" }
        ];
    
    svg.selectAll(".horizC")
        .data(y.ticks())
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", function(e) { return y(e); })
        .attr("y2", function(e) { return y(e); })
        .style("stroke-width", 1)
        .style("stroke-dasharray", "5 5")
        .style("stroke", "lightgray")
        .style("fill", "none");
    svg.selectAll(".horizD")
        .data(y2.ticks())
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", function(e) { return y2(e); })
        .attr("y2", function(e) { return y2(e); })
        .style("stroke-width", 1)
        .style("stroke-dasharray", "5 5")
        .style("stroke", "lightgray")
        .style("fill", "none");
    
    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("refX", 1)
        .attr("refY", 13)
        .attr("markerWidth", 11)
        .attr("markerHeight", 15)
        .attr("orient", "right")
        .append("path")
        .attr("d", "M2,2 L2,13 L8,7 L2,2");
    
    xD = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    xD.select("path").attr("marker-end", "url(#arrowhead)");
    xC = svg.append("g")
        .attr("transform", "translate(0," + (height / 2 - pad) + ")")
        .call(d3.axisBottom(x));
    xC.select("path").attr("marker-end", "url(#arrowhead)");
    
    svg.append("g")
        .call(d3.axisLeft(y));
    svg.append("g")
        .attr("transform", "translate(" + width + ",0)")
        .call(d3.axisRight(y));
    svg.append("text")
        .attr("y", 0)
        .attr("dy", 10)
        .attr("x", 10)
        .style("fill", couleur_malades)
        .text("Malades");    
    
    svg.append("g")
        .call(d3.axisLeft(y2));
    svg.append("g")
        .attr("transform", "translate(" + width + ",0)")
        .call(d3.axisRight(y2));
    svg.append("text")
        .attr("y", height / 2 + pad)
        .attr("x", 10)
        .attr("dy", 10)
        .style("fill", couleur_deces)
        .text("Décès");    
    
    if (france) {
        svg.selectAll(".etape")
            .data(etapes)
            .enter()
            .append("line")
            .attr("x1", function(d) { return x(Date.parse(d.date)); })
            .attr("x2", function(d) { return x(Date.parse(d.date)); })
            .attr("y1", function(d, i) { return (etapes.length - i - 1) * 15; })
            .attr("y2", height)
            .style("stroke-width", 2)
            .style("stroke-dasharray", "10 5")
            .style("stroke", "lightgray")
            .style("fill", "none");
        svg.selectAll(".etape")
            .data(etapes)
            .enter()
            .append("text")
            .attr("x", function(d) { return x(Date.parse(d.date)); })
            .attr("y", function(d, i) { return (etapes.length - i - 1) * 15; })
            .attr("dx", "-5")
            .style("text-anchor", "end")
            .style("fill", "gray")
            .html(function (d) { return d.libelle; });        
    }

    svg.append("path")
        .datum(donnees)
        .attr("fill", "none")
        .attr("stroke", couleur_malades)
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.date); })
            .y(function (d) { return y(d.confirmes); })
            );
    svg.append("path")
        .datum(donnees)
        .attr("fill", "none")
        .attr("stroke", couleur_deces)
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.date); })
            .y(function (d) { return y2(d.morts); })
            );
    

}
