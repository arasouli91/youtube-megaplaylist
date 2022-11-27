// THIS IMPLEMENTATION IS OUTDATED
// WE ENDED UP JUST COPYING AND PASTING THIS FUNCTION INTO ALL THE SL FUNCTIONS
// BECAUSE IDK WHAT IS WRONG WITH IMPORTING INTO THEM


// used by serverless functions
export const findOrCreateUpdateRecord = async (collection, id, props = null) => {
    let result = await collection.findOne({ _id: id });
    // if record DNE, fetch from yt api, create new record
    if (!result) {
        const uri1 = `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails`;
        let uri = uri1 + `&id=${id}&key=${process.env.REACT_APP_YOUTUBE_API_KEY1}`;
        let ytVideo = await fetch(uri).then(res => res.json()).catch(e => "FAILED");
        if (!ytVideo || ytVideo === "FAILED") {
            let uri = uri1 + `&id=${id}&key=${process.env.REACT_APP_YOUTUBE_API_KEY2}`;
            ytVideo = await fetch(uri).then(res => res.json());
        }

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
