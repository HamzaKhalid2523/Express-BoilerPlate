import express from "express";
import http from "http";
import InitApp from "./init-app";

const app = express();
const server = http.createServer(app);

require("dotenv").config();

process.on('uncaughtException', (err: any) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

InitApp(app, express).then(function(){
    server.listen(app.get("port"));
    console.log("listening on port", app.get("port"));
});

process.on('unhandledRejection', (err: any) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

