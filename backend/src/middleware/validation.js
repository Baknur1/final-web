const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        next();
    };
};

const authSchemas = {
    register: Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('super_admin', 'manager', 'worker', 'supplier'),
        warehouse_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '', 'undefined').optional()
            .messages({ 'string.pattern.base': 'Invalid Warehouse ID format' })
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
};

const resourceSchemas = {
    item: Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        warehouse_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '', 'undefined').required(),
        length: Joi.number().required(),
        width: Joi.number().required(),
        height: Joi.number().required()
    }),
    warehouse: Joi.object({
        name: Joi.string().required(),
        address: Joi.string().required(),
        shelf_length: Joi.number().required(),
        shelf_width: Joi.number().required(),
        shelf_height: Joi.number().required()
    }),
    scan: Joi.object({
        quantity: Joi.number().min(0).required(),
        defects: Joi.number().min(0).required(),
        length: Joi.number().required(),
        width: Joi.number().required(),
        height: Joi.number().required()
    })
};

module.exports = { validate, authSchemas, resourceSchemas };
