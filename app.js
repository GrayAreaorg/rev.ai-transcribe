const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const revai = require("revai-node-sdk");
require("dotenv").config();

if (!process.env.REVAI_ACCESS_TOKEN) {
  console.log("Access token not found. Add token to .env");
  process.exit();
}

const token = process.env.REVAI_ACCESS_TOKEN;

// initialize client with audio configuration and access token
const audioConfig = new revai.AudioConfig(
  "audio/x-raw", // contentType
  "interleaved", // layout
  16000, // sample rate
  "S16LE", // format
  1 // channels
);

var client = new revai.RevAiStreamingClient(token, audioConfig);

// initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// serve static files from 'public' directory
app.use(express.static("public"));

// create event responses
client.on("close", (code, reason) => {
  console.log(`Connection closed, ${code}: ${reason}`);
});
client.on("httpResponse", (code) => {
  console.log(`Streaming client received http response with code: ${code}`);
});
client.on("connectFailed", (error) => {
  console.log(`Connection failed with error: ${error}`);
});
client.on("connect", (connectionMessage) => {
  console.log(`Connected with message: ${JSON.stringify(connectionMessage)}`);
});

// begin streaming session
var stream = client.start();

// create event responses
//this is the audio stream in JSON
stream.on("data", (data) => {
  // emit data to all connected clients
  // console.log(data);
  io.emit("caption", data);
});
stream.on("end", function () {
  console.log("End of Stream");
});

// microphone
const mic = require("mic");

// initialize microphone configuration
const micConfig = {
  rate: 16000, // sample rate
  channels: 1, // channels
  device: "hw:0,0", // device id 
};

var micInstance = mic(micConfig);

// create microphone stream
var micStream = micInstance.getAudioStream();

micStream.on("error", (error) => {
  console.log(`Microphone input stream error: ${error}`);
});

// pipe the microphone audio to Rev AI client
micStream.pipe(stream);

// start the microphone
micInstance.start();

// start server
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
