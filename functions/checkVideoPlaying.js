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
        let resultStr = `The video ${id} was not currently playing.`;

        // check if this video is playing
        let videoPlayingResult = await collection.findOne({ _id: "videoPlaying" });
        console.log(videoPlayingResult);
        if (!videoPlayingResult) {
            throw new Error("wasn't able to check video playing");
        } else {
            if (videoPlayingResult.videoId === id) { // this video is playing
                // increment the play count for this video
                collection = database.collection("video");
                let videoResult = await collection.findOne({ _id: id });
                const plays = videoResult.plays + 1;
                let updateRes = await collection.updateOne({ _id: id }, { $set: { plays: plays } });
                if (!updateRes) throw new Error("Failed to update play count");
                resultStr = `The video ${id} was currently playing. Updated play count: ${plays}`;
            }
        }
        return {
            statusCode: 200,
            body: JSON.stringify(resultStr),
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
