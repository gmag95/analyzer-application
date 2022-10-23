const express = require("express");
router = express.Router();
const viewData = require("../controllers/viewdata");
const {isLoggedIn} = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const {documentSearch, postingSearch, dateCheck} = require("../inputValidation");
const appError = require("../utils/appError");

function validateDocumentSearch (req, res, next) {
    const {error} = documentSearch.validate(req.query);
    if (error) {
        throw new appError(error.message, 500);
    } else {
        next();
    }
}

function validatePostingSearch (req, res, next) {
    const {error} = postingSearch.validate(req.query);
    if (error) {
        throw new appError(error.message, 500);
    } else {
        next();
    }
}

function validateDate (req, res, next) {
    const {error} = dateCheck.validate(req.query);
    if (error) {
        console.log("ERROR")
        throw new appError(error.message, 500);
    } else {
        next();
    }
}

router.get("/statement", validateDate, viewData.statement);

router.get("/getStatementData", validateDate, viewData.getStatementData);

router.get("/documents", viewData.viewDocuments)

router.post("/getDocumentData", validateDocumentSearch, viewData.getDocumentData)

router.delete("/deletedocument", isLoggedIn, viewData.deleteDocument)

router.get("/postings", viewData.viewPostings)

router.post("/getPostingData", validatePostingSearch, viewData.getPostingData)

module.exports = router;