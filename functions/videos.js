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