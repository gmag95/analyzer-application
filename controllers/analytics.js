const {pool} = require('../db/index');

module.exports.department = (req, res) => {
    let query = {
        text: "select * from acc_center_query($1)",
        rowMode: "array",
        values: [(req.query.year) ? req.query.year : new Date().getFullYear()]
    }
    pool.query(query)
        .then(result => {
            let query_labels = new Array();
            let query_data = new Array();
            let query_colors = new Array();
            let query_codes = new Array();
            let red_color = [230, 100, 100];
            let green_color = [0, 160, 0];
            let total_pl=0;
            for (let row of result.rows) {
                query_labels.push(row[0]);
                query_data.push(row[1].toLocaleString("it-IT", {maximumFractionDigits:0}));
                query_codes.push(row[2]);
                total_pl+=Number(row[1]);
                if (row[1]<=0) {
                    query_colors.push(`rgb(${green_color[0]}, ${green_color[1]}, ${green_color[2]})`)
                    if (green_color[0]+70<255) {
                        green_color[0]=green_color[0]+70;
                        green_color[2]=green_color[2]+70;
                    }
                } else {
                    query_colors.push(`rgb(${red_color[0]}, ${red_color[1]}, ${red_color[2]})`)
                    red_color[1]=red_color[1]-30;
                    red_color[2]=red_color[2]-30;
                }
            }
            res.render("analytics/department.ejs", {query_labels, query_data, query_colors, query_codes, total_pl: total_pl.toLocaleString("it-IT", {maximumFractionDigits:0}), sel_year: (req.query.year) ? req.query.year : null})
        })
        .catch(err => {res.status(err.status).render("error", {err});})
}

module.exports.country = (req, res) => {

    let query = {
        text: "select * from country_query($1)",
        rowMode: "array",
        values: [(req.query.year) ? req.query.year : new Date().getFullYear()]
    }
    pool.query(query)
        .then(result => {

            json_list = {
                "type": "FeatureCollection",
                "features": []
            }

            let red_color = [230, 100, 100];
            let green_color = [0, 160, 0];
            let query_colors = new Array();
            let total_pl=0;
            for (let row of result.rows) {
               json_list["features"].push({
                "type": "Feature",
                "properties": {
                "title": row[0],
                "description": Number(row[1]).toLocaleString("it-IT", {maximumFractionDigits:0}),
                "code": row[2]
                },
                "geometry": {
                "type": "Point",
                "coordinates": [row[3], row[4]]
                }
                })
                total_pl+=Number(row[1]);
                if (row[1]<=0) {
                    query_colors.push([row[0], row[5],`rgb(${green_color[0]}, ${green_color[1]}, ${green_color[2]})`])
                    if (green_color[0]+45<255) {
                        green_color[0]=green_color[0]+45;
                        green_color[2]=green_color[2]+45;
                    }
                } else {
                    query_colors.push([row[0], row[5], `rgb(${red_color[0]}, ${red_color[1]}, ${red_color[2]})`])
                    red_color[1]=red_color[1]-30;
                    red_color[2]=red_color[2]-30;
                }
            }
            res.render("analytics/country.ejs", {json_list, query_colors, sel_year: (req.query.year) ? req.query.year : null, total_pl});
        })
        .catch(err => {res.status(err.status).render("error", {err});})
}

module.exports.history = (req, res) => {

    let query = {
        text: "select * from history_query($1)",
        rowMode: "array",
        values: [new Date().getFullYear()]
    }
    pool.query(query)
        .then(result => {

            curr_year = new Date().getFullYear();
            labels = [curr_year-4, curr_year-3, curr_year-2, curr_year-1, curr_year];
            year_result = [0,0,0,0,0];

            datasets = [{
                label: "Insurance costs",
                type: "bar",
                stack: "costs",
                backgroundColor: "#b91313",
                code: "0010",
                data: []
              }, {
                label: "Investment costs",
                type: "bar",
                stack: "costs",
                backgroundColor: "#cc3333",
                code: "0020",  
                data: [],
              }, {
                label: "Misc. costs",
                type: "bar",
                stack: "costs",
                backgroundColor: "#de5858",
                code: "0030",
                data: []
              },{
                label: "Insurance revenue",
                type: "bar",
                stack: "revenue",
                backgroundColor: "#007300",
                code: "0010",
                data: [],
              }, {
                label: "Investment revenue",
                type: "bar",
                stack: "revenue",
                backgroundColor: "#1a8f1a",
                code: "0020",
                data: [],
              }, {
                label: "Misc. revenue",
                type: "bar",
                stack: "revenue",
                backgroundColor: "#39ad39",
                code: "0030",     
                data: [],
              }];
            let i=0;
            for (let row of result.rows) {
                if (row[1]=="Investment" && row[3]<=0) {
                    datasets[4]["data"].push(Math.abs((row[3]/1000000)));
                } else if (row[1]=="Investment" && row[3]>0) {
                    datasets[1]["data"].push((row[3]/1000000));
                } else if (row[1]=="Insurance" && row[3]<=0) {
                    datasets[3]["data"].push(Math.abs((row[3]/1000000)));
                } else if (row[1]=="Insurance" && row[3]>0) {
                    datasets[0]["data"].push((row[3]/1000000));
                } else if (row[1]=="Misc." && row[3]<=0) {
                    datasets[5]["data"].push(Math.abs((row[3]/1000000)));
                } else if (row[1]=="Misc." && row[3]>0) {
                    datasets[2]["data"].push((row[3]/1000000));
                }
                year_result[Math.floor(i/6)]+=row[3]/1000000;
                i++;
            }
            res.render("analytics/history.ejs", {datasets, labels, year_result});
        })
        .catch(err => {res.status(err.status).render("error", {err});})

}

module.exports.userStats = (req, res) => {
    var error = false;
    let query = {
        text: "select * from userstats_query()",
        rowMode: "array"
    }
    pool.query(query)
        .then(firstQueryResults => {
            let query = {
                text: "select * from user_crosstab($1)",
                rowMode: "array",
                values: [new Date().getFullYear()]
            }
            pool.query(query)
                .then(secondQueryResults => {
                    res.render("analytics/userstats.ejs", {firstResults : firstQueryResults.rows, secondResults : secondQueryResults.rows, curr_year: new Date().getFullYear()});
                })
                .catch(err => {
                    if (!error) {
                        res.status(err.status).render("error", {err});
                    }
            })
            
        })
        .catch(err => {error=true; res.status(err.status).render("error", {err});})
}