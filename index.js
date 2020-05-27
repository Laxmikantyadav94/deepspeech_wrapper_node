const EventEmitter = require("events");
const modelLoader = require("./loadModel");
const streamServer = require("./streaming");
const myEmitter = new EventEmitter();
const audioStreamCb = modelLoader(myEmitter);
streamServer(audioStreamCb,myEmitter)