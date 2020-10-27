var fs = require('fs');
const gvi = require('./gvi')
const readableBytes = require('./readableBytes')
const { queue } = require('./queue.js')

// Setup firestore here 
const admin = require("firebase-admin");
const serviceAccount = require("../indekksu-firebase-key.json");
const { metadata } = require('exiftool');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://nykelab.firebaseio.com"
});
const db = admin.firestore();


let listFiles = (dir) => {

    return new Promise((resolve, reject) => {

        fs.readdir('/Users/sibyl/Downloads/iphoneVideos', (err, files) => {
            if (err) {
                reject(err)
            }
            resolve(files)
        })
    })

}


fs.readdir('/Users/sibyl/Downloads/iphoneVideos', async (err, files) => {

    for (file in files) {
        
    }

    files.forEach(file => {

        if (file === '.DS_Store') { return; }

        let job = queue.createJob({
            file,
        })
        job
            .setId(file)
            .save()

    })

})








