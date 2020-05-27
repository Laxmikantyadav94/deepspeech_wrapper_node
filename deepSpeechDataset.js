var fs = require('fs');
const path = require('path');
const nBlob = require('node-blob');
var save = require('save-file');



const deepSpeechDataset={

    save:function(audioBuffer,text){
        return new Promise((resolve,reject) =>{
            try{
                let fileName = Math.random().toString(36).slice(2)+".wav"
                
                let filePath = path.join(__dirname, "/datasets");
                if(!fs.existsSync(filePath)){
                    fs.mkdirSync(filePath);
                }

                filePath = path.join(__dirname, "/datasets/clips");
                if(!fs.existsSync(filePath)){
                    fs.mkdirSync(filePath);
                }

                filePath = path.join(__dirname, "/datasets/clips/"+fileName);;
                const tsvFilePath = path.join(__dirname, "/datasets/train.tsv");
                
                let audioBlob = new nBlob([audioBuffer],{type: "audio/wav"});
                save(audioBlob,filePath);
        
                if(!fs.existsSync(tsvFilePath)){
                    fs.writeFileSync(tsvFilePath, "path"+"\t"+"sentence"+"\n"+fileName+"\t"+text);
                }else{
                    fs.appendFileSync(tsvFilePath,"\n"+fileName+"\t"+text)
                }

                resolve(filePath);

            }catch(err){
                console.log("Error while saving deepSpeechDataset")
                reject(err);
            }
        })

    }

}

module.exports = deepSpeechDataset;