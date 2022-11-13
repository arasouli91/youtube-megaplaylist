/*
Responsible for setting start and end of a given video
Input:
-id
-start
-end

If video DNE, create new video
*/
const { MongoClient } = require("mongodb");
const { findOrCreateUpdateRecord } = require("../src/shared/shared");

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

