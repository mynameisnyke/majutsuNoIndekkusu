var exiftool = require('exiftool');
var fs = require('fs');
const axios = require('axios')

// Define youre google api key here if you want to turn exif geodata into human readable text
const geoApikey = 'AIzaSyDEE-gqEYrwAGF2Man69dSKxfZY7oyRGDU'



const fileMetadataScan = (file) => {

    console.log(`${file} was received in fileMetadataScan`)

        return new Promise((resolve, reject) => {

            fs.readFile(file, function (err, data) {

                if (err)
                    reject(err);
                else

                    exiftool.metadata(data, function (err, metadata) {

                        if (err)
                            reject(err);
                        if (metadata.gpsLatitude) {

                            // Parse exif for lat and long, and convert to decimal
                            let gpsLatituded = parseInt(metadata.gpsLatitude.match(/^\d+/g))
                            let gpsLatitudemin = parseInt(metadata.gpsLatitude.match(/\d+'/g)[0].replace("'", ""))
                            let gpsLatitudesec = parseInt(metadata.gpsLatitude.match(/\d+.\d+"/g)[0].replace('"', ""))
                            let gpsLatitudeDD = gpsLatituded + (gpsLatitudemin / 60) + (gpsLatitudesec / 3600)

                            // Checks the exif return for Sourth or North and then appends - if South
                            if (metadata.gpsLatitude.includes('S')) {
                                gpsLatitudeDD = `-${gpsLatitudeDD}`
                            }



                            let gpsLongituded = parseInt(metadata.gpsLongitude.match(/^\d+/g))
                            let gpsLongitudemin = parseInt(metadata.gpsLongitude.match(/\d+'/g)[0].replace("'", ""))
                            let gpsLongitudesec = parseInt(metadata.gpsLongitude.match(/\d+.\d+"/g)[0].replace('"', ""))
                            let gpsLongitudeDD = gpsLongituded + (gpsLongitudemin / 60) + (gpsLongitudesec / 3600)

                            // Checks the exif return for West or East and then appends - if West
                            if (metadata.gpsLongitude.includes('W')) {
                                gpsLongitudeDD = `-${gpsLongitudeDD}`
                            }

                            // Converts the geocodes to human readable


                            axios({
                                method: 'get',
                                url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${gpsLatitudeDD},${gpsLongitudeDD}&key=${geoApikey}`,
                            }).then(res => {
                                metadata.gpsLatitudeDD = gpsLatitudeDD
                                metadata.gpsLongitudeDD = gpsLongitudeDD
                                metadata.location = res.data.results[0].geometry.location
                                metadata.country = res.data.plus_code.compound_code.match(/\w+$/g).shift()
                                resolve(metadata)
                            }).catch(err => reject(err))

                        } else {
                            resolve(metadata)
                        }

                    });
            })

        })

}

module.exports.fileMetadataScan = fileMetadataScan

