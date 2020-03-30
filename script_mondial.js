/*global d3,Promise */

function nettoyageDessin () {
    d3.select("#graph").html("");
}

function dessinEvolution(donnees) {
    "use strict";
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
            .range([ height, 0 ]);
    
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

function transform (files) {
    var confirmes = files[0],
        test_date = new RegExp("[0-9]+/[0-9]+/[0-9]+"),
        dates = Object.keys(confirmes[0]).filter(function (e) { return test_date.test(e); });
    console.log("--- transform ---")
    console.log(dates);
    console.log(confirmes[0]);
    test = confirmes[0];
    donnees = dates.map(function (e) {
                var res = {
                    d: e,
                    date: Date.parse(e),
                    confirmes: test[e]
                };
                return res;
            });
    console.log(donnees);
}

function modif_regions (files, pays) {
    var infos_pays = files[0].filter(function (e) { return e["Country/Region"] === pays; }),
        regions = [... new Set(infos_pays.map(function (e) { return e["Province/State"] }))];
    d3.select("#region").selectAll("option")
        .remove()
        .data(regions)
        .enter()
        .append("option")
        .property("selected", function(d){ return d === ""; })
        .html(function (e) { return e; });
}

function main() {
    "use strict";
    var url_base = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/";
    // pour faire des tests
    url_base = "test/";
    Promise.all([
        d3.csv(url_base + "time_series_covid19_confirmed_global.csv"),
        d3.csv(url_base + "time_series_covid19_deaths_global.csv"),
        d3.csv(url_base + "time_series_covid19_recovered_global.csv")
    ]).then(function (files) {
        var data = files.map(function (e) { return e.filter(function (d) { return (d["Country/Region"] === "France" & d["Province/State"] === ""); }); }),
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
        
        d3.select("#pays").selectAll("option")
            .data([... new Set(files[0].map(function (e) { return e["Country/Region"] }))])
            .enter()
            .append("option")
            .property("selected", function(d){ return d === "France"; })
            .html(function (e) { return e; });
        modif_regions(files, "France");
        
        d3.select("#pays").on("change", function() {
            var pays = d3.select(this).property("value");
            modif_regions(files, pays);
        });
        
        d3.select("#go").on("click", function () {
            console.log("GO !!");
            var pays = d3.select("#pays").property("value"),
                region = d3.select("#region").property("value"),
                data = files.map(function (e) { return e.filter(function (d) { return (d["Country/Region"] === pays & d["Province/State"] === region); }); }),
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
            nettoyageDessin();
            dessinEvolution(donnees);
        });
    }).catch(function (err) {
        d3.select("#graph").html("Problème de chargement des données : " + err);
    });
}

main();