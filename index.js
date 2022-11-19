const vision = require('@google-cloud/vision');
const NodeWebcam = require("node-webcam");
const fs = require('fs');
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

async function scanImage() {    
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

scanImage();
