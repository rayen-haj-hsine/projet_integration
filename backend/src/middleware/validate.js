
import Joi from 'joi';

export function validate(schema) {
    return (req, res, next) => {
        const data = ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : req.query;
        const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
        if (error) {
            error.status = 422;
            return next(error);
        }
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) req.body = value;
        else req.query = value;
        next();
    };
}
