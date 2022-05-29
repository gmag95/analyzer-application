const {pool} = require('../db/index');
var moment = require('moment'); 

module.exports.statement = async (req, res) => {
    if (req.query.date && req.query.date!=moment().format().slice(0,10)) {
        let query = {
            text: "select * from render_custom_coa($1)",
            rowMode: "array",
            values: [req.query.date]
        }
        pool.query(query)
            .then(result => res.render("viewdata/statement.ejs", {coa:result.rows, date: req.query.date, hidden:false}))
            .catch(err => {req.flash("error", err.message); return res.redirect("/statement");})
    }
    else {
        let query = {
            text: "select * from render_current_coa()",
            rowMode: "array"
        }
        var hidden = true;
        if (req.query.date) {
            hidden = false;
        }
        pool.query(query)
            .then(result => res.render("viewdata/statement.ejs", {coa:result.rows, date: moment().format().slice(0,10), hidden}))
            .catch(err => {res.status(err.status).render("error", {err});})
    }
}

module.exports.viewDocuments = (req, res) => {
    if (req._parsedOriginalUrl.query==null) {
        res.render("viewdata/documents.ejs", {result: undefined, page:undefined, result_n:undefined, usercode: undefined, name:undefined, surname:undefined, docnum: undefined, doctype: undefined, startdate: undefined, enddate: undefined});
    } else {
        var error = false;
        let query_n = {
            text: "select * from return_doc_num($1, $2, $3, $4, $5, $6, $7)",
            rowMode: "array",
            values: [(req.query.usercode.length==0) ? null : req.query.usercode, (req.query.name.length==0) ? null : req.query.name, (req.query.surname.length==0) ? null : req.query.surname, (req.query.docnum.length==0) ? null : req.query.docnum, (req.query.doctype.length==0) ? null : req.query.doctype, (req.query.startdate==0) ? null : req.query.startdate, (req.query.enddate.length==0) ? null : req.query.enddate]
        }
        pool.query(query_n)
            .then(result_n => {
                let query = {
                    text: "select * from return_doc($1, $2, $3, $4, $5, $6, $7, $8)",
                    rowMode: "array",
                    values: [(req.query.usercode.length==0) ? null : req.query.usercode, (req.query.name.length==0) ? null : req.query.name, (req.query.surname.length==0) ? null : req.query.surname, (req.query.docnum.length==0) ? null : req.query.docnum, (req.query.doctype.length==0) ? null : req.query.doctype, (req.query.startdate==0) ? null : req.query.startdate, (req.query.enddate.length==0) ? null : req.query.enddate, req.query.page || null]
                }
                pool.query(query)
                    .then(result => {res.render("viewdata/documents.ejs", {result: result.rows, page: req.query.page || 0, result_n:result_n.rows[0][0], usercode: req.query.usercode, name:req.query.name, surname:req.query.surname, docnum: req.query.docnum, doctype: req.query.doctype, startdate: req.query.startdate, enddate: req.query.enddate, address:process.env.ADDRESS})})
                    .catch(err => {
                        if (!error) {
                            req.flash("error", err.message); return res.redirect("/documents");
                        }
                })
            })
            .catch(err => {error=true;req.flash("error", err.message); return res.redirect("/documents");})
}}

module.exports.getDocumentData = (req, res) => {
    let query = {
        text: "select * from return_doc($1, $2, $3, $4, $5, $6, $7, $8)",
        rowMode: "array",
        values: [(req.body.usercode.length==0) ? null : req.body.usercode, (req.body.name.length==0) ? null : req.body.name, (req.body.surname.length==0) ? null : req.body.surname, (req.body.docnum.length==0) ? null : req.body.docnum, (req.body.doctype.length==0) ? null : req.body.doctype, (req.body.startdate==0) ? null : req.body.startdate, (req.body.enddate.length==0) ? null : req.body.enddate, req.body.page]
    }
    pool.query(query)
        .then(result => {res.send(result.rows)})
        .catch(err => {res.send(err)})
}

module.exports.deleteDocument = (req, res) => {
    let query = {
        text: "call delete_doc($1)",
        values: [req.body.deleteset.split(",")]
    }
    pool.query(query)
        .then(() => {
            if (Number(req.body.page)>0 && Number(req.body.result_n)-req.body.deleteset.split(",").length<Number(req.body.page)*10+1) {
                req.body.page = Number(req.body.page)-Math.ceil(req.body.deleteset.split(",").length/10);
            }
            req.flash("success", `Successfully deleted the following documents: ${req.body.deleteset.split(",")}`)
            res.redirect(`/documents?usercode=${req.body.usercode}&name=${req.body.name}&surname=${req.body.surname}&docnum=${req.body.docnum}&doctype=${req.body.doctype}&startdate=${req.body.startdate}&enddate=${req.body.enddate}&page=${req.body.page}`);
        })
        .catch(err => {req.flash("error", err.message); return res.redirect("/documents");})
}

module.exports.viewPostings = (req, res) => {
    if (req._parsedOriginalUrl.query==null) {
        res.render("viewdata/postings.ejs", {result: undefined, page:undefined, result_n:undefined, glcode: undefined, description: undefined, startregdate: undefined, endregdate: undefined, starteffdate: undefined, endeffdate: undefined, costcenter: undefined, docnum: undefined, usercode: undefined, acccenter: undefined, ordernum: undefined, paymode: undefined, supplcode: undefined, countrycode: undefined, fs_pos: undefined})
    } else {
        var error = false;
        let query_n = {
            text: "select * from return_postings_num($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)",
            rowMode: "array",
            values: [(req.query.glcode.length==0) ? null : req.query.glcode, (req.query.description.length==0) ? null : req.query.description, (req.query.startregdate.length==0) ? null : req.query.startregdate, (req.query.endregdate.length==0) ? null : req.query.endregdate, (req.query.starteffdate.length==0) ? null : req.query.starteffdate, (req.query.endeffdate==0) ? null : req.query.endeffdate, (req.query.costcenter.length==0) ? null : req.query.costcenter, (req.query.docnum.length==0) ? null : req.query.docnum, (req.query.usercode.length==0) ? null : req.query.usercode, (req.query.acccenter.length==0) ? null : req.query.acccenter, (req.query.ordernum.length==0) ? null : req.query.ordernum, (req.query.paymode.length==0) ? null : req.query.paymode, (req.query.supplcode.length==0) ? null : req.query.supplcode, (req.query.countrycode.length==0) ? null : req.query.countrycode, (req.query.fs_pos.length==0) ? null : req.query.fs_pos]
        }
        pool.query(query_n)
            .then(result_n => {
                let query = {
                    text: "select * from return_postings($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)",
                    rowMode: "array",
                    values: [(req.query.glcode.length==0) ? null : req.query.glcode, (req.query.description.length==0) ? null : req.query.description, (req.query.startregdate.length==0) ? null : req.query.startregdate, (req.query.endregdate.length==0) ? null : req.query.endregdate, (req.query.starteffdate.length==0) ? null : req.query.starteffdate, (req.query.endeffdate==0) ? null : req.query.endeffdate, (req.query.costcenter.length==0) ? null : req.query.costcenter, (req.query.docnum.length==0) ? null : req.query.docnum, (req.query.usercode.length==0) ? null : req.query.usercode, (req.query.acccenter.length==0) ? null : req.query.acccenter, (req.query.ordernum.length==0) ? null : req.query.ordernum, (req.query.paymode.length==0) ? null : req.query.paymode, (req.query.supplcode.length==0) ? null : req.query.supplcode, (req.query.countrycode.length==0) ? null : req.query.countrycode, (req.query.fs_pos.length==0) ? null : req.query.fs_pos, req.query.page || null]
                }
                pool.query(query)
                    .then(result => {res.render("viewdata/postings.ejs", {result: result.rows, page: req.query.page || 0, result_n:result_n.rows[0][0], glcode: req.query.glcode, description:req.query.description, startregdate:req.query.startregdate, endregdate: req.query.endregdate, starteffdate: req.query.starteffdate, endeffdate: req.query.endeffdate, costcenter: req.query.costcenter, docnum: req.query.docnum, usercode: req.query.usercode, acccenter: req.query.acccenter, ordernum: req.query.ordernum, paymode: req.query.paymode, supplcode: req.query.supplcode, countrycode: req.query.countrycode, fs_pos: req.query.fs_pos})})
                    .catch(err => {
                        if (!error) {
                            req.flash("error", err.message); return res.redirect("/postings");
                        }
                })
            })
            .catch(err => {error=true;req.flash("error", err.message); return res.redirect("/postings");})
}}

module.exports.getPostingData = (req, res) => {
    let query = {
        text: "select * from return_postings($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)",
        rowMode: "array",
        values: [(req.body.glcode.length==0) ? null : req.body.glcode, (req.body.description.length==0) ? null : req.body.description, (req.body.startregdate.length==0) ? null : req.body.startregdate, (req.body.endregdate.length==0) ? null : req.body.endregdate, (req.body.starteffdate.length==0) ? null : req.body.starteffdate, (req.body.endeffdate==0) ? null : req.body.endeffdate, (req.body.costcenter.length==0) ? null : req.body.costcenter, (req.body.docnum.length==0) ? null : req.body.docnum, (req.body.usercode.length==0) ? null : req.body.usercode, (req.body.acccenter.length==0) ? null : req.body.acccenter, (req.body.ordernum.length==0) ? null : req.body.ordernum, (req.body.paymode.length==0) ? null : req.body.paymode, (req.body.supplcode.length==0) ? null : req.body.supplcode, (req.body.countrycode.length==0) ? null : req.body.countrycode, (req.body.fs_pos.length==0) ? null : req.body.fs_pos, req.body.page]
    }
    pool.query(query)
        .then(result => {res.send(result.rows)})
        .catch(err => {res.send(err)})
}