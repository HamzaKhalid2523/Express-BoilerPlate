import { NextFunction, Request, Response } from "express";
import RequestCacheHandler from "./middleware/request-cache";
import RoutesIndex from "./routes/index.routes";

export default async function InitializeApp(app: any, express: any) {
  const accessControls = require("./middleware/access-controls");
  const mongoose = require("mongoose");
  const cors = require("cors");

  const globalErrorHandler = require('./utils/appErrorHandler');
  const AppError = require('./utils/appError');

  initBodyParser(app);

  await connectMongoose(mongoose);

  clearConsole(app);

  staticResponses(app, express);

  app.set("port", process.env.PORT);

  app.use(accessControls);
  app.use(cors());

  app.use(RequestCacheHandler.getCache);

  // Routes which should handle requests

  RoutesIndex(app);

  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });

  app.use(globalErrorHandler);
}

function initBodyParser(app: any) {
  const bodyParser = require("body-parser");

  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  app.use(bodyParser.json()); // to support JSON-encoded bodies
}
function staticResponses(app: any, express: any) {
  // in case you want to serve images

  app.use(express.static("public"));

  app.get("/", function (req: Request, res: Response) {
    res.status(200).send({
      message: "Express backend server!",
    });
  });
}
async function connectMongoose(mongoose: any) {
  // connection to mongoose
  const node_env = process.env.NODE_ENV;
  let mongoCon = node_env === "local" ? process.env.mongoCon : process.env.mongoCon_Prod;

  await mongoose.connect(mongoCon, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
  mongoose.set("runValidators", true);

  mongoose.connection.on("connected", function () {
    console.log("Mongoose connected to database");
  });
  mongoose.connection.on("error", function (err: any) {
    console.log("Mongoose connection error: " + err);
  });
  mongoose.connection.on("disconnected", function () {
    console.log("Mongoose disconnected");
  });
}
function clearConsole(app: any) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.clear();
    console.log("----------------------------------------------------------");
    next();
  });
}
