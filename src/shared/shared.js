
// used by serverless functions
export const findOrCreateUpdateRecord = async (collection, id, props = null) => {
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