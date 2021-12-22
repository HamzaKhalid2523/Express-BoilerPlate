import { NextFunction, Request, Response } from "express";

const redis = require("../config/redis").authRedis;
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

module.exports = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    return next(new AppError('User Authentication Failed. Please login to get access!', 401));
  }

  const user = await redis.get(token);
  if (!user) {
    return next(new AppError('User Authentication Failed. Please login to get access!', 401));
  }

  req.user = JSON.parse(user);
  if (req.user.is_deleted || !req.user.status) {
    return next(new AppError('User account is disabled. Please login to get access!', 401));
  }

  next();
});
