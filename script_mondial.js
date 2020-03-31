/*global d3,Promise */

function modif_regions(files, pays) {
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
    // url_base = "test/";
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
            var pays = d3.select("#pays").property("value"),
                region = d3.select("#region").property("value"),
                data = files.map(function (e) { 
                    return e.filter(function (d) { return (d["Country/Region"] === pays & d["Province/State"] === region); });
                }),
                confirmes = data[0][0],
                test_date = new RegExp("[0-9]+/[0-9]+/[0-9]+"),
                dates = Object.keys(confirmes).filter(function (e) { return test_date.test(e); }),
                donnees = dates.map(function (e) {
                    var res = {
                        d: e,
                        date: Date.parse(e),
                        confirmes: data[0][0][e],
                        morts: data[1][0][e]//,
                        //retablis: data[2][0][e]
                    };
                    return res;
                });
            nettoyageDessin();
            dessinEvolution(donnees, false);
        });
    }).catch(function (err) {
        d3.select("#graph").html("Problème de chargement des données : " + err);
    });
}

main();