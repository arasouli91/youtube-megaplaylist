/*
Responsible for checking if a video is playing
And, if so, incrementing the video's plays metric
Input:
-id
Only works in single increments?
Do you debounce before calling this api?
Then you would want to be able to pass in higher values

If video DNE, create new video
*/
const { MongoClient } = require("mongodb");
const mongoClient = new MongoClient(process.env.REACT_APP_MONGODB_URI);
const clientPromise = mongoClient.connect();
const { findOrCreateUpdateRecord } = require("../src/shared/shared");

const handler = async (event) => {
    try {
        const database = (await clientPromise).db("youtube");
        let collection = database.collection("data");
        const id = event.queryStringParameters["id"];

        // if this video is playing
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
        return { statusCode: 500, body: error.toString() }
    }
}

module.exports = { handler }
