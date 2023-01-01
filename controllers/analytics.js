const {pool} = require('../db/index');

module.exports.department = (req, res) => {
    let query = {
        text: "select * from acc_center_query($1)",
        values: [new Date().getFullYear()]
    }
    pool.query(query)
        .then(result => {
            res.render("analytics/department.ejs", {queryResult: result.rows})
        })
        .catch(err => {res.status(err.status).render("error", {err});})
}

module.exports.country = (req, res) => {

    let query = {
        text: "select * from country_query($1)",
        rowMode: "array",
        values: [new Date().getFullYear()]
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

                if (Number(row[1])==0) {
                    query_colors.push([row[0], row[5],"rgb(195, 195, 195)"]);
                }
                else if (row[1]<0) {
                    query_colors.push([row[0], row[5],`rgb(${green_color[0]}, ${green_color[1]}, ${green_color[2]})`]);
                    if (green_color[0]+45<255) {
                        green_color[0]=green_color[0]+45;
                        green_color[2]=green_color[2]+45;
                    }
                } else {
                    query_colors.push([row[0], row[5], `rgb(${red_color[0]}, ${red_color[1]}, ${red_color[2]})`]);
                    red_color[1]=red_color[1]-30;
                    red_color[2]=red_color[2]-30;
                }
            }
            console.log(json_list, query_colors, total_pl);
            res.render("analytics/country.ejs", {json_list, query_colors, total_pl});
        })
        .catch(err => {res.status(err.status).render("error", {err});})
}

module.exports.history = (req, res) => {

    let query = {
        text: "select * from history_query($1)",
        values: [new Date().getFullYear()]
    }
    pool.query(query)
        .then(result => {

            res.render("analytics/history.ejs", {queryResult : result.rows});

        })
        .catch(err => {res.status(err.status).render("error", {err});})

}

module.exports.userStats = (req, res) => {
    var error = false;
    let query = {
        text: "select * from userstats_query()"
    }
    pool.query(query)
        .then(firstQueryResults => {
            let query = {
                text: "select * from user_crosstab_d3($1)",
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

module.exports.getDepartmentData = (req, res) => {
    let query = {
        text: "select * from acc_center_query($1)",
        values: [(req.query.year) ? req.query.year : new Date().getFullYear()]
    }
    pool.query(query)
        .then(result => {res.send(result.rows);})
        .catch(err => {res.send(err)})
}


module.exports.getCountryData = (req, res) => {

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
                if (Number(row[1])==0) {
                    query_colors.push([row[0], row[5],"rgb(195, 195, 195)"]);
                }
                else if (row[1]<0) {
                    query_colors.push([row[0], row[5],`rgb(${green_color[0]}, ${green_color[1]}, ${green_color[2]})`]);
                    if (green_color[0]+45<255) {
                        green_color[0]=green_color[0]+45;
                        green_color[2]=green_color[2]+45;
                    }
                } else {
                    query_colors.push([row[0], row[5], `rgb(${red_color[0]}, ${red_color[1]}, ${red_color[2]})`]);
                    red_color[1]=red_color[1]-30;
                    red_color[2]=red_color[2]-30;
                }
            }
            res.send([json_list, query_colors, total_pl]);
        })
        .catch(err => {res.status(err.status).render("error", {err});})
}