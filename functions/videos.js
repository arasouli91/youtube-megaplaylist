/*
Retrieve videos
If id is provided, then just retrieve that video
*/
const fetch = require('node-fetch');
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.REACT_APP_MONGODB_URI);

const clientPromise = mongoClient.connect();

const handler = async (event) => {
    try {
        let results;
        const database = (await clientPromise).db("youtube");
        const collection = database.collection("video");
        let dict = {};

        const id = event.queryStringParameters["id"];
        if (id) {
            results = await findOrCreateUpdateRecord(collection, id);
        } else {
            results = await collection.find({}).toArray();
            results.sort(compare);
            // the client will use this dict to find the id of a video and then use the index
            // as a way to sort on the client side
            results.forEach((x, index) => {
                if (x._id) {
                    let videoId = x._id;
                    dict[videoId] = index;
                }
            });
            console.log(JSON.stringify(dict));
        }
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(dict),
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

const compare = (a, b) => {
    let scoreA = parseInt(a.plays) + parseInt(a.likes);
    let scoreB = parseInt(b.plays) + parseInt(b.likes);
    return scoreB - scoreA; // desc
};

//// We copied and pasted these to all the functions bcuz importing it doesn't seem to work
///TODO: try to factor this out again

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
    console.log(`inside findOrCreateUpdateRecord ${updateSet}`);

    console.log(`updates ${updateSet.start} and ${updateSet.end}`);
    let result = await collection.findOne({ _id: id });
    // if record DNE, fetch from yt api, create new record
    if (!result) {
        const uri1 = `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails`;
        let uri = uri1 + `&id=${id}&key=${process.env.REACT_APP_YOUTUBE_API_KEY1}`;
        let ytVideo = await fetch(uri).then(res => res.json());
        if (!ytVideo || ytVideo === "FAILED") {
            let uri = uri1 + `&id=${id}&key=${process.env.REACT_APP_YOUTUBE_API_KEY2}`;
            ytVideo = await fetch(uri).then(res => res.json());
        }

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
            console.log("we have updates,", updateSet);
            mergeIntoUpdateSet(result, updateSet);
            console.log("we have updates,", updateSet);
            await collection.updateOne({ _id: id }, { $set: updateSet });
            result = Object.assign(result, updateSet); // update locally
            console.log(result);
        }
    }
    // return what was retrieved or what was updated or what was created
    return result;
}
