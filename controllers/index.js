const {pool} = require('../db/index');

module.exports.indexPage = (req, res) => {
    var error = false;
    let query = {
        text: "select * from latest_uploads()",
        rowMode: "array"
    }
    pool.query(query)
        .then(latestPostingsResults => {
                    let query = {
                        text: "select * from current_balances()",
                        rowMode: "array"
                    }
                    pool.query(query)
                        .then(currentBalancesResults => {
                            res.render("index.ejs", {firstResults : latestPostingsResults.rows, secondResults: currentBalancesResults.rows});
                        })
                        .catch(err => {
                            if (!error) {
                                res.status(err.status).render("error", {err});
                            }
                    })
                })
        .catch(err => {error=true; res.status(err.status).render("error", {err});})
}