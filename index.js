const vision = require('@google-cloud/vision');
const NodeWebcam = require("node-webcam");
const readLine = require('readline');
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

readLine.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

async function scanImage() {    
    console.log('taking picture');
    camera.capture("image", async (error, data) => {
        if (error != null) {
            console.log("Failed to snap image: " + error);
            return;
        }
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
    })
}

process.stdin.on('keypress', async (charater, key) => {
    if (key.name == 'space') {
        await scanImage();
    } else if (key.name == 'q') {
        process.exit(0);
    }
  })


console.log('Welcome to wastecam! Press space to scan item or q to quit.');