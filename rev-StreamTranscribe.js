const revai = require('revai-node-sdk');
require('dotenv').config()

if (!process.env.REVAI_ACCESS_TOKEN) {
    console.log('Access token not found. Add token to .env');
    process.exit();
}

const token = process.env.REVAI_ACCESS_TOKEN;

// initialize client with audio configuration and access token
const audioConfig = new revai.AudioConfig(
    /* contentType */ "audio/x-raw",
    /* layout */      "interleaved",
    /* sample rate */ 16000,
    /* format */      "S16LE",
    /* channels */    1
);

var client = new revai.RevAiStreamingClient(token, audioConfig);

// create event responses
client.on('close', (code, reason) => {
    console.log(`Connection closed, ${code}: ${reason}`);
});
client.on('httpResponse', code => {
    console.log(`Streaming client received http response with code: ${code}`);
});
client.on('connectFailed', error => {
    console.log(`Connection failed with error: ${error}`);
});
client.on('connect', connectionMessage => {
    console.log(`Connected with message: ${JSON.stringify(connectionMessage)}`);
});

// begin streaming session
var stream = client.start();

// create event responses
//this is the audio stream in JSON
stream.on('data', data => {
  console.log(data);
});
stream.on('end', function () {
  console.log("End of Stream");
});

// microphone
const mic = require('mic');

// initialize microphone configuration
// note: microphone device id differs
// from system to system and can be obtained with
// arecord --list-devices and arecord --list-pcms
const micConfig = {
    /* sample rate */ rate: 16000,
    /* channels */    channels: 1,
    /* device id */   device: 'hw:0,0'
};

var micInstance = mic(micConfig);

// create microphone stream
var micStream = micInstance.getAudioStream();

micStream.on('error', error => {
  console.log(`Microphone input stream error: ${error}`);
});

// pipe the microphone audio to Rev AI client
micStream.pipe(stream);

// start the microphone
micInstance.start();

// Forcibly ends the streaming session
// stream.end();