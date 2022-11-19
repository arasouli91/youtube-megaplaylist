/*
Retrieve channels
*/
const fetch = require('node-fetch');
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.REACT_APP_MONGODB_URI);

const clientPromise = mongoClient.connect();

const handler = async (event) => {
    try {
        let results;
        const database = (await clientPromise).db("youtube");
        const collection = database.collection("channel");
        // results is a sorted array of objects
        results = await collection.find({}).toArray();
        console.log(JSON.stringify(results));

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(results),
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
/*
fetch as an object
findAll = (req, res) => {
  File.find({}, function(err, result) {
    if (err) console.log(err);
    else {
      return res.json({ result });
    }
  });
};
*/

module.exports = { handler }
