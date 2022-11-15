/*
Responsible for setting the current playing video
Input:
-id
If video DNE, create new video
Returns video
*/
const fetch = require('node-fetch');
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.REACT_APP_MONGODB_URI);

const clientPromise = mongoClient.connect();

const handler = async (event) => {
    try {
        const database = (await clientPromise).db("youtube");
        let collection = database.collection("data");
        const id = event.queryStringParameters["id"];

        // set video as playing
        let result = await collection.updateOne({ _id: "videoPlaying" }, { $set: { videoId: id } });
        if (!result) {
            throw new Error("wasn't able to update video playing");
        }

        // find or create video
        collection = database.collection("video");
        result = await findOrCreateUpdateRecord(collection, id);// will throw if fails
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        }
    }
    catch (error) {
        const err = `${error.lineNumber}:${error.columnNumber}:
        ${error.fileName}\n
        ${error.message}\n
        ${error.stack}`;
        console.log(err);
        return { statusCode: 500, body: error.toString() }
    }
}

module.exports = { handler }

//// We copied and pasted these to all the functions bcuz importing it doesn't seem to work

const mergeIntoRecord = (record, updatesObj) => {
    let keys = Object.keys(updatesObj); // keys of updates object
    for (var i = 0; i < keys.length; ++i) {
        if (keys[i] === "likes" || keys[i] === "plays")
            record[keys[i]] = parseInt(record[keys[i]]) + parseInt(updatesObj[keys[i]]);
        else
            record[keys[i]] = updatesObj[keys[i]];
    }
}

// for the properties that exist in updatesObj, and need to be combined,
// find them in record, then combine those properties in updatesObj
const mergeIntoUpdateSet = (record, updatesObj) => {
    let keys = Object.keys(updatesObj); // keys of updates object

    // for the keys of update object
    for (var i = 0; i < keys.length; ++i) {
        if (keys[i] === "likes" || keys[i] === "plays")
            updatesObj[keys[i]] = parseInt(updatesObj[keys[i]]) + parseInt(record[keys[i]]);
        // else obj1[keys[i]] = obj2[keys[i]]; // No! updateset doesn't need this
    }
}

const findOrCreateUpdateRecord = async (collection, id, updateSet = null) => {
    let result = await collection.findOne({ _id: id });
    // if record DNE, fetch from yt api, create new record
    if (!result) {
        /////TODO: We need to be able to switch yt api keys if one fails, factor it out
        let uri = `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails`
            + `&id=${id}&key=${process.env.REACT_APP_YOUTUBE_API_KEY1}`;
        let ytVideo = await fetch(uri).then(res => res.json());

        //"duration": "PT8M5S", can be single or double digit
        let durationStr = ytVideo.items[0].contentDetails.duration;
        let minStr = durationStr.substr(2);
        let secStr = durationStr.substr(durationStr.indexOf('M') + 1);
        let duration = parseInt(minStr) * 60 + parseInt(secStr);

        if (ytVideo) {
            // construct object
            let obj = {
                _id: id,
                likes: 0,
                plays: 1,
                start: -1,
                end: -1,
                duration: duration
            };
            // set any properties that deviate from default
            if (updateSet) {
                mergeIntoRecord(obj, updateSet);
            }
            result = await collection.insertOne(obj);
            if (result) {
                return obj; // we created this, so it is same as what we inserted
            } else {
                throw new Error("mongodb insertOne failed somehow");
            }
        } else {
            throw new Error("youtube video was not created... yt api issue?");
        }
    } else {// record exists
        // if we have updates
        if (updateSet) {
            mergeIntoUpdateSet(result, updateSet);
            await collection.updateOne({ _id: id }, { $set: updateSet });
            result = Object.assign(result, updateSet); // update locally
        }
    }
    // return what was retrieved or what was updated or what was created
    return result;
}
