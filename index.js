const vision = require('@google-cloud/vision');
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
const { initializeApp } = require('firebase/app');
const firebaseConfig = {
    apiKey: "AIzaSyANLLQZdj6pdnN7WfSkwwjHMg7NaXweFN4",
    authDomain: "bestbefore-f04a1.firebaseapp.com",
    projectId: "bestbefore-f04a1",
    storageBucket: "bestbefore-f04a1.appspot.com",
    messagingSenderId: "892829937514",
    appId: "1:892829937514:web:de1c0bae29bde28190ff13"
  };
const firebase = initializeApp(firebaseConfig);

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
    console.log('analyzing image');
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.textDetection('image.jpg');
    const [logoResult] = await client.logoDetection('image.jpg');
    const textLabels = result.textAnnotations;
    console.log('Text results:');
    textLabels.forEach(label => console.log(label.description));
    const logoLabels = logoResult.logoAnnotations;
    console.log("logo results:")
    logoLabels.forEach(logo => console.log(logo));        
}

console.log('Welcome to wastecam! Press space to scan item or q to quit.');
