/*
Responsible for setting start and end of a given video
Input:
-id
-start
-end

If video DNE, create new video
*/
const fetch = require('node-fetch');
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.REACT_APP_MONGODB_URI);

const clientPromise = mongoClient.connect();

const handler = async (event) => {
    try {
        const database = (await clientPromise).db("youtube");
        const collection = database.collection("video");
        const start = event.queryStringParameters["start"];
        const end = event.queryStringParameters["end"];
        const id = event.queryStringParameters["id"];
        console.log(`start: ${start}, end: ${end}, id: ${id}`);
        const updates = {
            start: start ? start : -1,
            end: end ? end : -1
        };
        console.log(`updates ${updates.start} and ${updates.end}`);
        // find/update or create
        const result = await findOrCreateUpdateRecord(collection, id, updates);// will throw if fails
        return {
            statusCode: 200,
            body: JSON.stringify(result), // this implies result is a json object
        }
    }
    catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}

module.exports = { handler }

//// We copied and pasted these to all the functions bcuz importing it doesn't seem to work

// for these keys, merge obj2 into obj1
const merge = (obj1, obj2, keys) => {
    for (var i = 0; i < keys.length; ++i) {
        if (keys[i] === "likes" || keys[i] === "plays") {
            obj1[keys[i]] = parseInt(obj1[keys[i]]) + parseInt(obj2[keys[i]]);
        }
        else
            obj1[keys[i]] = obj2[keys[i]];
    }
    return obj1;
}

const mergeIntoRecord = (record, updatesObj) => {
    let keys = Object.keys(updatesObj); // keys of updates object
    return merge(record, updatesObj, keys); // merge into record
}

// for the properties that exist in updatesObj,
// find them in record, then merge those properties in updatesObj
const mergeIntoUpdateSet = (record, updatesObj) => {
    let keys = Object.keys(updatesObj); // keys of updates object
    return merge(updatesObj, record, keys); // merge into updatesSet
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
        let secStr = durationStr.substr(durationStr.indexOf('M') + 1)

        if (ytVideo) {
            // construct object
            let obj = {
                _id: id,
                likes: 0,
                plays: 1,
                start: -1,
                end: -1,
                duration: parseInt(minStr) * 60 + parseInt(secStr)
            };
            // set any properties that deviate from default
            if (updateSet) {
                obj = mergeIntoRecord(obj, updateSet);
            }
            console.log("about to insert", obj);
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
            updateSet = mergeIntoUpdateSet(result, updateSet);
            console.log("we have updates,", updateSet);
            await collection.updateOne({ _id: id }, { $set: updateSet });
            result = Object.assign(result, updateSet); // update locally
            console.log(result);
        }
    }
    // return what was retrieved or what was updated or what was created
    return result;
}
