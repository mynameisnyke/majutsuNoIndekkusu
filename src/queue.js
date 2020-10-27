const Queue = require('bee-queue');
const { getLabels } = require('./gvi');
const queue = new Queue('label-maker');
const Arena = require('bull-arena');
const os = require('os')
const { limiter } = require('./bottlenecker')
const exif = require('./exif')
const hostname = os.hostname()

// Configure the queue here 
const Bee = require('bee-queue');
const { metadata } = require('exiftool');



Arena({
    // All queue libraries used must be explicitly imported and included.
    Bee,
    queues: [
        {
            // Required for each queue definition.
            name: 'label-maker',

            // User-readable display name for the host. Required.
            hostId: hostname,

            type: 'bee',
        },
    ],
});



// Process jobs from as many servers or processes as you like

queue.on('ready', async () => {

    console.log('Label Maker queue is now ready to start doing things');

    await limiter.schedule(async () => {

        queue.process(async (job) => {

            console.log(`Processing job ${job.id} ${job.data}`);


            // Scan file for metadata through exif before sending out to the cloud for mor info
           let metadata = await exif.fileMetadataScan(`/Users/sibyl/Downloads/iphoneVideos/${job.data.file}`)

            // Make the call out to @google-cloud/video-intelligence to find out what's in the image

            getLabels(job.data.file).then(labels => {

                // Post results to firestore collection of your choice
                db.collection(metadata.country).doc(job.data.file)
                    .update({
                        labels,
                        uris: {
                            og: 'gs://nrh-video/IMG_2561.MOV'
                        }
                    })
                    .catch(e => console.error(e))
                    .then(res => { return labels })
            }
            ).catch(e => {return e})
        });
    })
});

queue.on('error', async (err) => {
    console.error(`A queue error happened: ${err.message}`);
});

queue.on('succeeded', async (job, result) => {
    console.log(`Job ${job.id} succeeded with result: ${result}`);
    const counts = await queue.checkHealth();
    // print all the job counts
    console.log('job state counts:', counts.waiting, 'left');

});

queue.on('failed', async (job, err) => {
    // const counts =  await queue.checkHealth();
    // print all the job counts
    // console.log('job state counts:', counts);
    console.log(err)
    console.error(`Job ${job.data} failed with error ${err.message}`);
});

queue.on('job progress', (jobId, progress) => {
    console.log(`Job ${jobId} reported progress: ${progress}%`);
});



exports.queue = queue