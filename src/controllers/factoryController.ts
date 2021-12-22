import { NextFunction, Request, Response } from 'express';
import {AppError} from './../utils/appError';
import {APIFeatures} from './../utils/apiFeatures';

const catchAsync = require('./../utils/catchAsync');

exports.deleteOne = (Model: any, popOptions: any) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const query: any = req.query;
        let docPromise = Model.findByIdAndDelete(req.params.id);

        if (popOptions) docPromise.populate(popOptions);
        let doc = await docPromise;

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            message: 'Deleted Successfully!',
            data: null
        });
    });

exports.updateOne = (Model: any, popOptions: any) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let query: any = req.query;
        let data: any = {originalObj: {}, updatedObj: {}};

        let originalDocPromise = Model.findById(req.params.id);
        let updatedDocPromise = Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (popOptions) {
            originalDocPromise = originalDocPromise.populate(popOptions);
            updatedDocPromise = updatedDocPromise.populate(popOptions);
        }
        
        [data.originalObj, data.updatedObj] = await Promise.all([originalDocPromise, updatedDocPromise]);

        if (!data.originalObj || !data.updatedObj) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            message: 'Updated Successfully!',
            data: data.updatedObj
        });
    });

exports.createOne = (Model: any, popOptions: any) =>
    catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
        let query: any = req.query;
        let body = {
            ...req.body,
            created_by: req.user.username,
            created_by_role: req.user.role_type
        };
        let doc = new Model(body);

        if (popOptions) doc.populate(popOptions).execPopulate();
        await doc.save();

        res.status(201).json({
            status: 'success',
            message: 'Created Successfully!',
            data: doc
        });
    });

exports.getOne = (Model: any, popOptions: any) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let query: any = req.query;

        let dataPromise = Model.findById(req.params.id);

        if (popOptions) dataPromise = dataPromise.populate(popOptions);

        const doc = await dataPromise;

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: doc
        });
    });

exports.getAll = (Model: any, popOptions: any, unique_actions: any) =>
    catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
        let query: any = req.query;
        let user = req.user;
        let data = {docs: [], count: 0, unique_actions: []};
        let dataQuery = Model.find();
        let countQuery = Model.countDocuments();
        let uniqueActionsQuery = null;
    
        let dataPromise = new APIFeatures(user, dataQuery, req.query).filter().sort().limitFields().paginate();
        let countPromise = new APIFeatures(user, countQuery, req.query, 'count').filter();

        dataQuery = dataPromise.query;
        countQuery = countPromise.query;
        if (unique_actions) uniqueActionsQuery = Model.distinct(unique_actions);

        if (popOptions) dataQuery = dataQuery.populate(popOptions);

        [data.docs, data.count, data.unique_actions] = await Promise.all([dataQuery, countQuery, uniqueActionsQuery]);

        res.status(200).json({
            status: 'success',
            total: data.count,
            data: data.docs,
            unique_actions: data.unique_actions || null
        });
    });
