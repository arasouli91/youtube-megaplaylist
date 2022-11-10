exports.handler = async function (event, context) {
    let resPlaylist = [];
    return {
        statusCode: 200,
        body: JSON.stringify(resPlaylist)
    }
}