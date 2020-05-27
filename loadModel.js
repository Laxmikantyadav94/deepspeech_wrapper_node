#!/usr/bin/env node

const Sox = require("sox-stream");
const DeepSpeech = require("deepspeech");
const MemoryStream = require("memory-stream");
require("dotenv").config();
const googleApi = require('./google_microphone_streaming');
const deepSpeechDataset = require('./deepSpeechDataset');
const sqliteDB = require('./sqlite');

module.exports = emitter => {
  //const modelsPath = process.env.DEEPSPEECH_MODEL_PATH || "./models";
  //const modelsPath = "./model";
  
  const modelsPath = "./english-model/deepspeech6";

  const MODEL = modelsPath + "/output_graph.pb";
  const ALPHABET = modelsPath + "/alphabet.txt";
  const LM = modelsPath + "/lm.binary";
  const TRIE = modelsPath + "/trie";

  // These constants control the beam search decoder

  // Beam width used in the CTC decoder when building candidate transcriptions
  const BEAM_WIDTH = 1024;

  // The alpha hyperparameter of the CTC decoder. Language Model weight
  const LM_ALPHA = 0.75;

  // The beta hyperparameter of the CTC decoder. Word insertion bonus.
  const LM_BETA = 1.85;

  // These constants are tied to the shape of the graph used (changing them changes
  // the geometry of the first layer), so make sure you use the same constants that
  // were used during training

  // Number of MFCC features to use
  const N_FEATURES = 26;

  // Size of the context window used for producing timesteps in the input vector
  const N_CONTEXT = 9;

  function totalTime(hrtimeValue) {
    return (hrtimeValue[0] + hrtimeValue[1] / 1000000000).toPrecision(4);
  }

  console.log("Loading model from file %s", MODEL);
  const modelLoadStart = process.hrtime();
  const model = new DeepSpeech.Model(
    MODEL,
    BEAM_WIDTH
  );
  
  let desiredSampleRate = model.sampleRate();

  const modelLoadEnd = process.hrtime(modelLoadStart);
  console.error("Loaded model in %ds.", totalTime(modelLoadEnd));

  if (LM && TRIE) {
    console.error("Loading language model from files %s %s", LM, TRIE);
    const lmLoadStart = process.hrtime();
    model.enableDecoderWithLM(LM, TRIE, LM_ALPHA, LM_BETA);
    const lmLoadEnd = process.hrtime(lmLoadStart);
    console.error("Loaded language model in %ds.", totalTime(lmLoadEnd));
  } 

  const Duplex = require('stream').Duplex;

  const bufferToStream =(buffer) =>{
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
  
  sqliteDB.setUp();

  return function(stream) {
    const localStream = new MemoryStream();
    try{

      stream
      .pipe(localStream);
      
      localStream.on("finish", async () => {

        const rowBuffer = localStream.toBuffer();

        const audioStream = new MemoryStream();
        let myStream = bufferToStream(rowBuffer);
        
        myStream
        .pipe(
          Sox({
            global: {
              'no-dither': true,
            },
            output: {
              bits: 16,
              rate: desiredSampleRate,
              channels: 1,
              encoding: 'signed-integer',
              endian: 'little',
              compression: 0.0,
              type: 'raw'
            }
          })
        )
        .pipe(audioStream)

        audioStream.on("finish", async () => {
          const audioBuffer = audioStream.toBuffer();

          const audioLength = (audioBuffer.length / 2) * (1 / desiredSampleRate);

          const googleText= await googleApi.microphoneStream(audioBuffer);
          const text = model.stt(audioBuffer.slice(0, audioBuffer.length / 2));
          console.log("google text ---:"+googleText)
          console.log("stt text ---:"+text)

          const path = await deepSpeechDataset.save(rowBuffer,googleText);

          sqliteDB.insertData(path,text,googleText,audioLength);

          emitter.emit("text", { text });

        })       
      });
    }catch(err){
      console.log("ERROR------",err);
      emitter.emit("text", { err });
    }
    
  };
};