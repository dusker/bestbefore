const readLine = require('readline');
// Webcam config
const NodeWebcam = require("node-webcam");
const opts = {
    width: 1280,
    height: 720,
    delay: 0,
    output: "jpeg",
    device: false,
    callbackReturn: "location",
    verbose: true
};
const camera = NodeWebcam.create(opts);

// Firebase config
const serviceAccount = require('./firebase-service-account.json');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

initializeApp({
    credential: cert(serviceAccount)
  });
  
// Keyboard key handling config
readLine.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', async (charater, key) => {
    if (key.name == 'space') {
        await scanImage();
    } else if (key.name == 'p') {
        await processImage();
    } else if (key.name == 'q') {
        process.exit(0);
    }
  })

// Item scanning
async function scanImage() {    
    console.log('taking picture');
    camera.capture("image", async (error, data) => {
        if (error != null) {
            console.log("Failed to snap image: " + error);
            return;
        }
        await processImage();
    })
}

async function processImage() {
    const vision = require('@google-cloud/vision');
    console.log('analyzing image');
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.textDetection('image.jpg');
    const [logoResult] = await client.logoDetection('image.jpg');
    const [labelResult] = await client.labelDetection('image.jpg');
    const textLabels = result.textAnnotations;
    console.log('Item metadata:');
    var dates = []
    textLabels.forEach(label => {
        const date = extractExpirationDate(label.description);
        if (date != null) {
            dates += date;
        }
    });
    textLabels.forEach(label => console.log(label.description));
    const text = textLabels.reduce((previous, current) => {
        return previous + current.description + "\n";
    });
    const expirationDate = extractExpirationDate(text);
    console.log("Expiration date: " + expirationDate);

    const logoLabels = logoResult.logoAnnotations;
    if (expirationDate != null) {
        saveItem({
            expiry: Timestamp.fromDate(expirationDate),
            brand: extractLabel(logoResult.logoAnnotations),
            name: extractLabel(labelResult.labelAnnotations)
        });
    }
}

// Item metadata extraction

function extractExpirationDate(text) {
    if (text == null) { 
        return null
    }
    const regex = /\d{2}\.\d{2}\.\d{2}/gm
    const results = regex.exec(text);
    console.log('result: ' + results);
    if (results != null && results.length > 0) {
        const components = results[0].split(".");
        const year = parseInt(components[2]) + 2000;
        const dateString = year + "." + components[1] + "." + components[0];
        
        return new Date(dateString);
    } else {
        return null;
    }
}

function extractLabel(results) {        
    if (results.length > 0) {
        return results[0].description
    } else {
        return null
    }
}

// Item saving

async function saveItem(item) {
    console.log('saving item: ' + JSON.stringify(item));
    getFirestore().collection("products").add(item);
}

console.log('Welcome to wastecam! Press space to scan item or q to quit.');
