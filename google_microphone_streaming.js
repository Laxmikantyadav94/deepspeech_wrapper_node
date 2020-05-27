
// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');

const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

const googleApi={
  async microphoneStream(audioBuffer) {
    // [START micStreamRecognize]
    process.env.GOOGLE_APPLICATION_CREDENTIALS = "./speechRecognition-0e0e00aa7157.json"; 

    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    };

    const audio ={
      content: audioBuffer
    }
  
    const request = {
      config,
      audio,
      interimResults: false, //Get interim results from stream
    };
  
    
    // Creates a client
    const client = new speech.SpeechClient();
  
    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    //console.log(`Transcription: ${transcription}`);
    return transcription;
  
  }
}

module.exports =googleApi;