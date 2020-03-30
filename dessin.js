function nettoyageDessin () {
    d3.select("#graph").html("");
}

function dessinEvolution(donnees, france = true) {
    var margin = {top: 30, right: 40, bottom: 30, left: 60},
        width = 1000 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        
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
            .range([ height, 0 ]),

        y2 = d3.scaleLinear()
            .domain([0, d3.max(donnees, function (d) { return +d.morts * 1.2; })])
            .range([ height, 0 ]),
        
        etapes = [
            {date: "3/12/20", libelle: "allocution du président" },
            {date: "3/16/20", libelle: "école à la maison" },
            {date: "3/17/20", libelle: "début du confinement" }
        ];
    
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    
    svg.append("g")
        .call(d3.axisLeft(y));
    svg.append("text")
        .attr("y", 0 - margin.top)
        .attr("x", 0)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", couleur_malades)
        .text("Malades");    
    
    svg.append("g")
        .attr("transform", "translate(" + width + ",0)")
        .call(d3.axisRight(y2));
    svg.append("text")
        .attr("y", 0 - margin.top)
        .attr("x", width)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", couleur_deces)
        .text("Décès");    
    
    if (france) {
        svg.selectAll(".etape")
            .data(etapes)
            .enter()
            .append("line")
            .attr("x1", function(d) { return x(Date.parse(d.date)); })
            .attr("x2", function(d) { return x(Date.parse(d.date)); })
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke-width", 2)
            .style("stroke-dasharray", "10 5")
            .style("stroke", "lightgray")
            .style("fill", "none");
        svg.selectAll(".etape")
            .data(etapes)
            .enter()
            .append("text")
            .attr("x", function(d) { return x(Date.parse(d.date)) + 7; })
            .attr("y", 0)
            .style("writing-mode", "tb")
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
