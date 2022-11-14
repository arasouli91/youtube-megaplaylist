/*
Responsible for setting start and end of a given video
Input:
-id
-start
-end

If video DNE, create new video
*/
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.REACT_APP_MONGODB_URI);

const clientPromise = mongoClient.connect();

const handler = async (event) => {
    try {
        const database = (await clientPromise).db("youtube");
        const collection = database.collection("video");
        console.log(event)
        const start = event.queryStringParameters["start"];
        const end = event.queryStringParameters["end"];
        const id = event.queryStringParameters["id"];
        let statusCode = 200;

        let updates = {
            start: start ? start : -1,
            end: end ? end : -1
        };
        // find/update or create
        let result = await findOrCreateUpdateRecord(collection, id, updates);// will throw if fails
        return {
            statusCode: statusCode,
            body: JSON.stringify(result), // this implies result is a json object
        }
    }
    catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}

module.exports = { handler }


//// We copied and pasted these to all the functions bcuz importing it doesn't seem to work

// Merge obj1 properties with obj2 properties
const merge = (obj1, obj2) => {
    let keys = Object.keys(obj2);
    // some of them need to be added, some need to be replaced
    for (var i = 0; i < keys.length; ++i) {
        if (keys[i] === "likes" || keys[i] === "plays")
            obj1[keys[i]] += obj2[keys[i]];
        else
            obj1[keys[i]] = obj2[keys[i]];
    }
}

const findOrCreateUpdateRecord = async (collection, id, props = null) => {
    let result = await collection.findOne({ _id: id });
    // if record DNE, fetch from yt api, create new record
    if (!result) {
        /////TODO: We need to be able to switch yt api keys if one fails, factor it out
        let uri = `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails`
            + `&id=${id}&key=${process.env.REACT_APP_YOUTUBE_API_KEY1}`;
        const ytVideo = await (await fetch(uri)).json();

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
                obj = merge(obj, props);
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
    } else {
        // record exists
        // if we have updates
        if (props) {
            await collection.updateOne({ _id: id }, { $set: props });
        }
        // else just return what we retrieved and apply update here
        result = Object.assign(result, props);
    }
    return result; // just return the result we found
}
