/*
Retrieve videos
If id is provided, then just retrieve that video
*/
import fetch from "node-fetch";
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.REACT_APP_MONGODB_URI);

const clientPromise = mongoClient.connect();
///// I AM NOT SURE AT ALL IF I HAVE EVERYTHING MAKING SENSE ABOUT
///// WHAT IS RETURNING AWAITING AND .json()
const handler = async (event) => {
    try {
        let results;
        const database = (await clientPromise).db("youtube");
        const collection = database.collection("video");

        const id = event.queryStringParameters["id"];
        if (id) {
            results = await findOrCreateUpdateRecord(collection, id);
        } else {
            results = await collection.find({}).toArray();
        }
        return {
            statusCode: 200,
            body: JSON.stringify(results),
        }

    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}

module.exports = { handler }

//// We copied and pasted these to all the functions bcuz importing it doesn't seem to work

const merge = (obj1, obj2, keys) => {
    for (var i = 0; i < keys.length; ++i) {
        if (keys[i] === "likes" || keys[i] === "plays") {
            obj1[keys[i]] = parseInt(obj1[keys[i]]) + parseInt(obj2[keys[i]]);
        }
        else
            obj1[keys[i]] = obj2[keys[i]];
    }
}

// Merge obj1 properties with obj2 properties
// Obj1 will be the remote obj, and obj2 will be the updates
const mergeRecord = (record, updatesObj) => {
    let keys = Object.keys(updatesObj);
    merge(record, updatesObj, keys);
}
// We will want to take any of those properties from obj2 and merge into obj1
const mergeProps = (updatesObj, record) => {
    let keys = Object.keys(updatesObj); // keys of updates object
    merge(updatesObj, record, keys);
} // the result is the correct updates object to be given to mongodb

const findOrCreateUpdateRecord = async (collection, id, props = null) => {
    let result = await collection.findOne({ _id: id });
    // if record DNE, fetch from yt api, create new record
    if (!result) {
        console.log(fetch);
        /////TODO: We need to be able to switch yt api keys if one fails, factor it out
        let uri = `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails`
            + `&id=${id}&key=${process.env.REACT_APP_YOUTUBE_API_KEY1}`;
        console.log(uri);
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
            if (props) {
                mergeRecord(obj, props);
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
        if (props) {
            mergeProps(props, result);
            await collection.updateOne({ _id: id }, { $set: props });
        }
        // else just return what we retrieved and apply update here
        result = Object.assign(result, props);
    }
    return result; // just return the result we found
}
