/// WANT TO FACTOR ALL THIS OUT


import fb from 'firebase/compat/app';
import 'firebase/compat/auth';

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

fb.initializeApp(firebaseConfig);
const db = fb.database();
/*
videos:
return all videos from DB
*/
exports.handler = function (event, context, callback) {
    //const path = `videos/${event.}`
    const path = "videos";

    fb.get(fb.child(db, path)).then((snapshot) => {
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
}
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
