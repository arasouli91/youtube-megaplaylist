exports.handler = async function (event, context) {
    let resPlaylist = ["TEST TEST"];
    console.log("INSIDE SERVERLESS FUNCTION")
    return {
        statusCode: 200,
        body: JSON.stringify(resPlaylist)
    }
}