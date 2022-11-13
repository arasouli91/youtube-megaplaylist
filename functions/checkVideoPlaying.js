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

const handler = async (event) => {
    try {
        const database = (await clientPromise).db("youtube");
        let collection = database.collection("data");
        const id = event.queryStringParameters["id"];

        // check if this video is playing
        let videoPlayingResult = await collection.findOne({ _id: "videoPlaying" });
        if (!videoPlayingResult) {
            throw new Error("wasn't able to check video playing");
        } else {
            if (videoPlayingResult.id === id) { // this video is playing
                // increment the play count for this video
                let videoResult = await collection.findOne({ _id: id });
                const plays = videoResult.plays + 1;
                let updateRes = await collection.updateOne({ _id: id }, { $set: { plays: plays } });
                if (!updateRes) throw new Error("Failed to update play count");
            }
        }
        return {
            statusCode: 200,
            body: JSON.stringify("Successfully checked video playing"),
        }
    }
    catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}

module.exports = { handler }
