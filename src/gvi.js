// Imports the Google Cloud Video Intelligence library
const videoIntelligence = require('@google-cloud/video-intelligence');

// Creates a client
const client = new videoIntelligence.VideoIntelligenceServiceClient();

// Define your bucket here
let bucket = 'nrh-video'

async function getLabels(file) {

    const gcsUri = `gs://${bucket}/${file}`;
    console.log('Recieved a request to get labes for ' + gcsUri)
    // Construct request
    const request = {
        inputUri: gcsUri,
        features: ['LABEL_DETECTION'],
    };

    // Execute request
    const [operation] = await client.annotateVideo(request);

    console.log(
        'Waiting for operation to complete... (this may take a few minutes)'
    );

    const [operationResult] = await operation.promise();

    // Gets annotations for video
    const annotations = await operationResult.annotationResults[0];

    // Gets labels for video from its annotations
    const labelObjects = annotations.segmentLabelAnnotations;
    const labels = labelObjects.map(label => {
        console.log(label)
        return label.entity.description
    })

    return labels

}

module.exports.getLabels = getLabels





