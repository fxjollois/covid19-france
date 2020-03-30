/*global d3,Promise */

function main() {
    "use strict";
    var url_base = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/";
    // à décommenter pour faire des tests
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
        dessinEvolution(donnees);
    }).catch(function (err) {
        d3.select("#graph").html("Problème de chargement des données : " + err);
    });
}

main();