const Joi = require('joi');

const uploadJoiSchema = Joi.object({
    filename: Joi.string().required(),
    contentType: Joi.string().required(),
});

const renameJoiSchema = Joi.object({
    newFilename: Joi.string().min(1).required(),
});

const searchJoiSchema = Joi.object({
    query: Joi.string().min(0).required(),
});

const fileJoiSchema = Joi.object({
    filename: Joi.string().required(),
    key: Joi.string().required(),
    url: Joi.string().required(),
    createdAt: { type: Date, default: Date.now },
})

const validateSignupJoiSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const validateLoginJoiSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

module.exports = {
    uploadJoiSchema,
    renameJoiSchema,
    fileJoiSchema,
    searchJoiSchema,
    validateSignupJoiSchema,
    validateLoginJoiSchema
};