'use strict';

const Joi = require('joi');

module.exports = Joi.object()
    .keys({
        entry: Joi.boolean().label('entry'),
        id: Joi.alternatives()
            .try(Joi.number(), Joi.string())
            .required()
            .label('id'),
        file: Joi.string()
            .required()
            .label('file'),
        source: Joi.string()
            .required()
            .label('source'),
        deps: Joi.object()
            .required()
            .label('deps'),
    })
    .unknown()
    .label('feed item')
    .required();
