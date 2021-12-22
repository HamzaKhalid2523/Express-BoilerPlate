import { NextFunction, Request, Response } from "express";

const redisClient = require("../config/redis").cacheRedis;
import btoa from "btoa";

class RequestCacheHandler {
  static async getCache(req: Request, res: Response, next: NextFunction) {
    if (req.method === "GET" && !req.query.hard_refresh) {
      const key=btoa(req.originalUrl);
      // console.log(key);
      // console.log(req.originalUrl);
      const record = await redisClient.get(key);

      if (record) {
        const { hits, aggregations } = JSON.parse(record);
        console.log("Getting from cache......");
        return res.send({
          cache: true,
          code: "200",
          message: "Query successful",
          data: hits,
          from: hits.length,
          total: hits.total.value,
          aggregations,
        });
      }

      console.log("No cache found", record);
    }
    next();
  }
}

export default RequestCacheHandler;
