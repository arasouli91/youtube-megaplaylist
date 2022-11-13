/*
Responsible for like/dislike of a given video
Input:
-id
-likeCount
Only works in single increments?
Do you debounce before calling this api?
Then you would want to be able to pass in higher values

If video DNE, create new video
*/
//import { findOrCreateUpdateRecord } from "../src/shared/shared";
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.REACT_APP_MONGODB_URI);

const clientPromise = mongoClient.connect();

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
                obj = Object.assign(obj, props);
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

/*
queryStringParameters: { ASS: '666', BITCH: '420420420' },
multiValueQueryStringParameters: { ASS: [ '666' ], BITCH: [ '420420420' ] },
body: '{\r\n    "test":"TEST DATA DASDASDASDASDASDASDASD"\r\n}',
path: '/.netlify/functions/videos/123456789',
*/
/////CHANGE THIS TO DEFAULT TO LIKING THE CURRENT SONG IF NO ID IS PROVIDED
const handler = async (event) => {
    try {
        const database = (await clientPromise).db("youtube");
        const collection = database.collection("video");
        console.log(event)
        const likes = event.queryStringParameters["likes"];
        const id = event.queryStringParameters["id"];

        let updates = {
            likes: likes
        }
        // find/update or create
        let result = await findOrCreateUpdateRecord(collection, id, updates);// will throw if fails
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


/*
/// WANT TO FACTOR ALL THIS OUT
import { initializeApp } from "firebase/app";
import { getDatabase, get, child } from "firebase/database";

//import fb from 'firebase/compat/app';
//import 'firebase/compat/auth';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJ_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
*/
//fb.initializeApp(firebaseConfig);
//const db = fb.getdatabase();
/*
videos:
return all videos from DB
*/
/*
exports.handler = function (event, context, callback) {
    //const path = `videos/${event.}`
    const path = "videos.json";

    get(child(db, path)).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });

    //fb.set(fb.ref(db, path), object);

    /*
    //const body = JSON.parse(event.body).payload
    var newPostKey = db.ref().child(`submissions`).push().key;

    db.ref(`submissions/${newPostKey}`).set({
        body
    }, function (error) {
        if (error) {
            console.log('failed')
            return callback(null, {
                statusCode: error.status,
                body: JSON.stringify({
                    message: error.message,
                    error: error,
                })
            })
        }
        console.log('saved')
        return callback(null, {
            statusCode: 200,
            body: "Beep, boop, you just got serverless."
        })
    })
    */
//}

/*
exports.handler = async function (event, context) {
    let videos = ["TEST", "TEST"];
    console.log("INSIDE VIDEOS SERVERLESS FUNCTION")
    console.log(event);
    console.log(context);
    return {
        statusCode: 200,
        body: JSON.stringify(videos)
    }
}
*/
///// IT EASIEST TO WORK WITH QUERY STRING PARAMS
////// event.path split("/") get last token, this is path params
///// event.queryStringParameters["key"]
/*

queryStringParameters: { ASS: '666', BITCH: '420420420' },
multiValueQueryStringParameters: { ASS: [ '666' ], BITCH: [ '420420420' ] },
body: '{\r\n    "test":"TEST DATA DASDASDASDASDASDASDASD"\r\n}',
path: '/.netlify/functions/videos/123456789',
*/
