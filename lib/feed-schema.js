'use strict';

const Joi = require('joi');

module.exports = Joi.array()
    .label('feeds')
    .items([
        Joi.object()
            .keys({
                entry: Joi.boolean().required(),
                id: Joi.alternatives()
                    .try(Joi.number(), Joi.string())
                    .required(),
                file: Joi.string().required(),
                source: Joi.string().required(),
                deps: Joi.object().required(),
                expose: Joi.any().optional(),
                order: Joi.any().optional(),
                index: Joi.any().optional(),
                indexDeps: Joi.any().optional(),
            })
            .label('feed')
            .required(),
        Joi.object()
            .keys({
                id: Joi.alternatives()
                    .try(Joi.number(), Joi.string())
                    .required(),
                file: Joi.string().required(),
                source: Joi.string().required(),
                deps: Joi.object().required(),
                expose: Joi.any().optional(),
                order: Joi.any().optional(),
                index: Joi.any().optional(),
                indexDeps: Joi.any().optional(),
            })
            .label('feed')
            .optional(),
    ])
    .required();
