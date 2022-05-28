const {pool} = require('../db/index');
const ObjectsToCsv = require('objects-to-csv');
var fs = require('fs');
var copyFrom = require('pg-copy-streams').from;

module.exports.newDocument = (req, res) => {
    res.render("edit/new.ejs");
}

module.exports.uploadDocument = async (req, res) => {
    let data = [{user_code: req.body.code, document_date: req.body.date, document_type: req.body.doctype, company: req.body.company}]

    const csv = new ObjectsToCsv(data);
    let document_name = "document_".concat(req.session.passport.user, "_", req.body.identifier, ".csv");
    let postings_name = "postings_".concat(req.session.passport.user, "_", req.body.identifier, ".csv");
    csv.toDisk("./uploads/".concat(document_name));
    
    await pool.query("create temp table temp_document (user_code integer not null, document_date date not null, document_type varchar(4) not null, company varchar(4) not null); create temp table temp_postings (gl_code varchar(10) not null, position integer not null, amount numeric(20, 4) not null, cost_center varchar(4), reg_date date not null, acc_center varchar(4), eff_date date not null, order_num integer, discount numeric(5,4), pay_mode varchar(4), suppl_code varchar(4), location varchar(4), country_code varchar(4), document_num integer);")
    
    pool.connect(function (err, client, done) {
        let error_status = false;
        var stream = client.query(copyFrom("\copy temp_postings(gl_code, position, amount, cost_center, reg_date, acc_center, eff_date, order_num, discount, pay_mode, suppl_code, location, country_code) FROM STDIN WITH (FORMAT CSV, HEADER, DELIMITER ';')"));
        var fileStream = fs.createReadStream(`./uploads/${postings_name}`);
        fileStream.on('error', () => {if (!error_status) {
            error_status = true;
            req.flash("error", "Error: the format of the posting file is not correct"); 
            return res.redirect("/upload");
        }});
        stream.on('error', () => {if (!error_status) {
            error_status = true;
            req.flash("error", "Error: the format of the posting file is not correct"); 
            return res.redirect("/upload");
        }})
        fileStream.pipe(stream);
        var stream = client.query(copyFrom("\copy temp_document(user_code, document_date, document_type, company) FROM STDIN WITH (FORMAT CSV, HEADER, DELIMITER ',')"));
        var fileStream = fs.createReadStream(`./uploads/${document_name}`);
        fileStream.on('error', () => {if (!error_status) {
            error_status = true;
            req.flash("error", "document error"); 
            return res.redirect("/upload");
        }});
        stream.on('error', () => {if (!error_status) {
            error_status = true;
            req.flash("error", "document error"); 
            return res.redirect("/upload");
        }})
        fileStream.pipe(stream);
        client.query("call data_loading();")
        .then (() => {
            try {
                fs.unlinkSync(`./uploads/${postings_name}`);
                fs.unlinkSync(`./uploads/${document_name}`);
            } catch {
                if (!error_status) {
                    req.flash("error", err.message);
                    return res.redirect("/upload");
                }
            }
            req.flash("success", "Document uploaded successfully");
            res.redirect("/documents?usercode=&name=&surname=&docnum=&doctype=&startdate=&enddate=");
        })
        .catch((err) => {
            try {
                fs.unlinkSync(`./uploads/${postings_name}`);
                fs.unlinkSync(`./uploads/${document_name}`);
            } catch {
                if (!error_status) {
                    req.flash("error", err.message);
                    return res.redirect("/upload");
                }
            }
            if (!error_status) {
                req.flash("error", err.message);
                return res.redirect("/upload");
            }
        })
    })
}