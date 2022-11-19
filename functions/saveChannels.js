/*
Save channels
*/
const fetch = require('node-fetch');
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.REACT_APP_MONGODB_URI);

const clientPromise = mongoClient.connect();

const handler = async (event) => {
    try {
        const database = (await clientPromise).db("youtube");
        const collection = database.collection("channel");

        /*
        body: '{\r\n    "test":"TEST DATA DASDASDASDASDASDASDASD"\r\n}',
        */

        console.log("event.body in saveChannels", event.body);

        // remove whole collection
        collection.deleteMany({})
        /////// let's see what this event.body looks like first and then try
        collection.insertMany()

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify("success"),
        }

    } catch (error) {
        const err = `${error.lineNumber}:${error.columnNumber}:
        ${error.fileName}\n
        ${error.message}\n
        ${error.stack}`;
        console.log(err);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: err
        }
    }
}

module.exports = { handler }

