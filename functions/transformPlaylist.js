exports.handler = async function (event, context) {
    let resPlaylist = [];
    console.log("INSIDE SERVERLESS FUNCTION")
    return {
        statusCode: 200,
        body: JSON.stringify(resPlaylist)
    }
}