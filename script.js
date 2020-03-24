/*global d3,console,Promise */

function dessinEvolution(donnees) {
    "use strict";
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 1000 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        
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
    svg.append("g")
        .attr("transform", "translate(" + width + ",0)")
        .call(d3.axisRight(y2));
    
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
        .attr("x", function(d) { return x(Date.parse(d.date)) + 10; })
        .attr("y", 0)
        .style("writing-mode", "tb")
        .style("fill", "gray")
        .html(function (d) { return d.libelle; });


    svg.append("path")
        .datum(donnees)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.date); })
            .y(function (d) { return y(d.confirmes); })
            );
    svg.append("path")
        .datum(donnees)
        .attr("fill", "none")
        .attr("stroke", "darkred")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.date); })
            .y(function (d) { return y2(d.morts); })
            );
    

}

function main() {
    "use strict";
    var url_base = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/";
    Promise.all([
        d3.csv(url_base + "time_series_19-covid-Confirmed.csv"),
        d3.csv(url_base + "time_series_19-covid-Deaths.csv"),
        d3.csv(url_base + "time_series_19-covid-Recovered.csv")
    ]).then(function (files) {
        var data = files.map(function (e) { return e.filter(function (d) { return (d["Country/Region"] === "France"); }); }),
            confirmes = data[0][0],
            test_date = new RegExp("[0-9]+/[0-9]+/[0-9]+"),
            dates = Object.keys(confirmes).filter(function (e) { return test_date.test(e); }),
            donnees = dates.map(function (e) {
                var res = {
                    d: e,
                    date: Date.parse(e),
                    confirmes: data[0][0][e],
                    morts: data[1][0][e],
                    retablis: data[2][0][e]
                };
                return res;
            });
        dessinEvolution(donnees);
        // files[0] will contain file1.csv
        // files[1] will contain file2.csv
    }).catch(function (err) {
        // Gestion de l'erreur ici
        d3.select("#graph").html("Problème de chargement des données : " + err);
    });
}

main();