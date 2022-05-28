const BaseJoi = require("joi");
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.userSchema = Joi.object({
    username: Joi.string().required().min(1).max(30).escapeHTML(),
    name: Joi.string().required().min(1).max(20).escapeHTML(),
    surname: Joi.string().required().min(1).max(20).escapeHTML(),
    grade: Joi.string().required().min(1).max(4).invalid("9999").escapeHTML(),
    password: Joi.string().required().min(1).max(30).escapeHTML(),
    code: Joi.string().max(20).escapeHTML()
})

module.exports.postingSchema = Joi.object({
    code: Joi.number().required().invalid(13),
    date: Joi.date().required(),
    doctype: Joi.string().required().min(1).max(4).invalid("ZZZZ", "YYYY").escapeHTML(),
    company: Joi.string().required().min(1).max(4).escapeHTML(),
    identifier: Joi.number().required()
})

module.exports.documentSearch = Joi.object({
    page: Joi.alternatives().try(Joi.number(), Joi.string().valid("")),
    usercode: Joi.alternatives().try(Joi.number(), Joi.string().valid("")),
    name: Joi.string().min(0).max(20).escapeHTML(),
    surname: Joi.string().min(0).max(20).escapeHTML(),
    docnum: Joi.alternatives().try(Joi.number(), Joi.string().valid("")),
    doctype: Joi.string().min(0).max(4).escapeHTML(),
    startdate: Joi.alternatives().try(Joi.date(), Joi.string().valid("")),
    enddate: Joi.alternatives().try(Joi.date(), Joi.string().valid(""))
})

module.exports.postingSearch = Joi.object({
    page: Joi.alternatives().try(Joi.number(), Joi.string().valid("")),
    glcode: Joi.string().min(0).max(10).escapeHTML(),
    description: Joi.string().min(0).max(50).escapeHTML(),
    startregdate: Joi.alternatives().try(Joi.date(), Joi.string().valid("")),
    endregdate: Joi.alternatives().try(Joi.date(), Joi.string().valid("")),
    starteffdate: Joi.alternatives().try(Joi.date(), Joi.string().valid("")),
    endeffdate: Joi.alternatives().try(Joi.date(), Joi.string().valid("")),
    costcenter: Joi.string().min(0).max(4).escapeHTML(),
    docnum: Joi.alternatives().try(Joi.number(), Joi.string().valid("")),
    usercode: Joi.alternatives().try(Joi.number(), Joi.string().valid("")),
    acccenter: Joi.string().min(0).max(4).escapeHTML(),
    ordernum: Joi.alternatives().try(Joi.number(), Joi.string().valid("")),
    paymode: Joi.string().min(0).max(4).escapeHTML(),
    supplcode: Joi.string().min(0).max(4).escapeHTML(),
    countrycode: Joi.string().min(0).max(4).escapeHTML(),
    fs_pos: Joi.string().min(0).max(2).escapeHTML()
})

module.exports.numberCheck = Joi.object({
    year: Joi.number()
})

module.exports.dateCheck = Joi.object({
    date: Joi.date()
})