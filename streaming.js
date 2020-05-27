const fs = require("fs");
const path = require("path");
const http = require("http");
const express = require("express");
const serve = require("express-static");
const SocketIo = require("socket.io");
const ss = require("socket.io-stream");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.Server(app);
const io = SocketIo(server);

module.exports = function(streamCb, myEmitter) {
  // add socket io client libs from node_modules
  app.get("/socket.io-stream.js", (req, res) =>
    fs
      .createReadStream(require.resolve("socket.io-stream/socket.io-stream.js"))
      .pipe(res)
  );
  app.get("/socket.io.js", (req, res) =>
    fs
      .createReadStream(require.resolve("socket.io-client/dist/socket.io.js"))
      .pipe(res)
  );
  app.get("/socket.io.js.map", (req, res) => 
    fs
      .createReadStream(
        require.resolve("socket.io-client/dist/socket.io.js.map")
      )
      .pipe(res)
  );
  app.get("/adapter.js", (req, res) =>
    fs
      .createReadStream(require.resolve("webrtc-adapter/out/adapter.js"))
      .pipe(res)
  ); 

  app.use(serve(path.join(__dirname, "public")));
  // configure socket.io stream interface (add callbacks for audio stream & return text)

  io.on("connection", socket => {
      console.log("connected...");
    
    socket.emit("test", { text:"test" });

    ss(socket).on("abc", txt => {
        console.log("sdsdsd",txt);
    });

    ss(socket).on("audio", streamCb);
    myEmitter.on("text", text =>{
        console.log("test...",text);
            ss(socket).emit("sttresult", ss.createStream(), text)
        }       
    );
  });

  // start the server
  server.listen(PORT, () =>
    console.log(
      "Server is running at http://localhost:%s - You´re good to go!",
      server.address().port
    )
  );
};