/*
DETERMINE TOP CHANNELS
-hash channel names to count
-sort by count

INITIAL RUN:
FETCH ALL SONGS FROM YOUTUBE
MAP ALL THUMBNAILS TO CHANNEL NAMES
STORE IN DB

SUBSEQUENT RUNS:
JUST RETURN DICTIONARY FROM DB
....then there's no reason to call the worker...whatever...
...will you be able to retrieve in sorted order?

ultimately, this would be much better if we can take into account individual
song scores, because KEAN DYSSO is in 2nd place, but definitely not my favorite
this shouldn't be difficult, just get videoData, and then add a fraction of the score to count
.....if we implement this, then we want to more regularly do a clean run
...also it would be best if we didn't remove the whole collection, but wait until that becomes a problem
*/
const TOP_CHANNELS_LENGTH = 30;
let firstTry = true;
let api_key;
let api_key2;
let base_url = 'https://www.googleapis.com/youtube/v3/playlistItems?&part=snippet&playlistId=';


const fetchDict = async (api) => {
    return await fetch(api).then(resp => resp.json());
}
const saveDict = async (api, data) => {
    await fetch(api + data);
}
/*
INITIAL/CLEAN RUN:
Iterate playlist that was passed in
-Map channel names to count of songs
Sort this newly created channelDict into a list by count
Fetch all songs from YouTube
Iterate these songs to transform objects in channelDict to hold most relevant data
Determine list of top 50 channels by using sorted list
Fetch channel info for these from YouTube
Iterate results mapping images into channelDict
Push top 50 results from channelDict into collection
Save to DB
Return both channelDict and collection of sorted objects

NON-CLEAN RUN:
Get an unsorted list of objects from DB
Convert this into channelDict
Sort this newly created channelDict into a list by count
Push top 50 results from channelDict into collection
Return both channelDict and collection of sorted objects
*/

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = async (e) => {
    if (!e) return;
    let playlist = e?.data?.playlist;
    if (!playlist) return;
    let apiKeys = e?.data?.apiKeys;
    if (!apiKeys) return;
    let cleanRun = e?.data?.cleanRun; // if clean run, we will recalculate, else get from DB
    let root = e?.data?.root;
    let channelDict = {};
    const netlifySaveApi = `${root}/.netlify/functions/saveChannels?data=`;
    const netlifyGetApi = `${root}/.netlify/functions/getChannels`;

    console.log("CHANNELSWORKER received:", playlist, apiKeys, cleanRun)

    // subsequent runs: just return from DB
    if (!cleanRun) {
        // netlifyRes is unsorted list of objects
        let netlifyRes = await fetchDict(netlifyGetApi);
        console.log("netlifyRes:", netlifyRes)
        // convert into channelDict
        for (let i = 0; i < netlifyRes.length; i++) {
            let obj = netlifyRes[i];
            channelDict[obj._id] = obj;
        }
    }
    // initial/clean run: walk through playlist, hash all channel names to count
    for (let i = 0; i < playlist.length && cleanRun; i++) {
        let channel = playlist[i]?.snippet?.videoOwnerChannelTitle;
        if (channel) {
            if (channelDict[channel])
                channelDict[channel].count += 1;
            else {
                channelDict[channel] = { count: 1 };
            }
        }
    }
    console.log("channelDict: ", channelDict);
    // { channel1: {count:count1}, channel2: {count:count2}, ...}
    // sort by count
    let channels = Object.keys(channelDict);
    channels = channels.sort((a, b) => channelDict[b].count - channelDict[a].count); //b-a is descending
    console.log("sorted channels" + channels);

    ////// INITIAL/CLEAN RUN: fetch all songs from youtube
    api_key = apiKeys[0];
    api_key2 = apiKeys[1];
    let res;
    if (cleanRun) {
        res = await youTubeFetch("PLmIkV2QRPyhkiEl9jxtKvpIRg50n0rfSj");
        console.log("CHANNELSWORKER fetch youtube playlist", res);
        // map channel ids
        for (let i = 0; i < res.length; i++) {
            let channel = res[i]?.snippet?.videoOwnerChannelTitle;
            let id = res[i].snippet?.videoOwnerChannelId;
            if (channel) {
                if (channelDict[channel]) {
                    channelDict[channel] = { _id: channel, count: channelDict[channel].count, id: id }
                }
            }
        }
        // algorthm gets painful if we have to retrieve more than 50 ids
        // so get list of top 50 ids
        let ids = `${channelDict[channels[0]].id}`;
        for (let i = 1; i < 50; i++) {
            if (channelDict[channels[i]]?.id)
                ids += "," + channelDict[channels[i]].id;
        }
        // fetch channels
        base_url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${ids}`;
        console.log("base_url: " + base_url);
        res = await youTubeFetch("PLmIkV2QRPyhkiEl9jxtKvpIRg50n0rfSj");
        console.log("CHANNELSWORKER fetch youtube channels", res);
        // map image to channel
        for (let i = 0; i < res.length; i++) {
            let channel = res[i]?.snippet?.title;
            let thumb = findFirstThumbnail(res[i]?.snippet?.thumbnails);
            if (channel) {
                if (channelDict[channel]) {
                    channelDict[channel].thumb = thumb;
                }
            }
        }
    }
    let collection = [];
    for (let i = 0; i < 50; i++) {
        collection.push(channelDict[channels[i]]);
    }
    console.log("CHANNELSWORKER channelDict: ", channelDict);
    console.log("CHANNELSWORKER collection: ", collection)
    // upload to database, overwrite entire object
    if (cleanRun) {
        console.log("CHANNELSWORKER save to db", JSON.stringify(collection));
        saveDict(netlifySaveApi, encodeURIComponent(JSON.stringify(collection)));
    }

    ///// in order to preserve sorted order, but also to have a dict, we return a sorted array and dict
    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({
        sortedList: collection,
        channelDict: channelDict
    });
}

const youTubeFetchInner = async (res_id, page_token) => {
    try {
        const config = {
            method: 'GET',
            mode: 'cors',
        };

        const genUrl = (apikey) => {
            if (page_token)
                return `${base_url}${res_id}&pageToken=${page_token}&maxResults=50&key=${apikey}`;
            return `${base_url}${res_id}&maxResults=50&key=${apikey}`;
        }

        let result = await fetch(genUrl(api_key), config).then(res => res.json()).catch(e => "FAILED");
        if (firstTry && (!result || result === "FAILED")) { // switch other apikey for subsequent requests
            api_key = api_key2;
            result = await fetch(genUrl(api_key), config).then(res => res.json());
            firstTry = false;
        }
        return result;
    }
    catch (e) {
        throw new Error(e)
    }
}

const youTubeFetch = async (res_id) => {
    // keep getting next page token and concatenating results
    try {
        let pagetoken = null;
        let res = [];
        let i = 0;
        while (i < 100) { // get up to 5K songs
            let partialRes = await youTubeFetchInner(res_id, pagetoken);
            if (partialRes?.items) {
                res.push(...partialRes?.items);
            }
            pagetoken = partialRes?.nextPageToken;
            if (!pagetoken) {
                break;
            }
            ++i;
        }

        // returned whole remote playlist
        console.log("CHANNELSWORKER: return remote list, res", res)
        return res
    }
    catch (e) {
        throw new Error(e)
    }
}

function findFirstThumbnail(thumbs) {
    if (thumbs === null) {
        return "";
    }
    if (thumbs["maxres"])
        return thumbs["maxres"].url;
    if (thumbs["standard"])
        return thumbs["standard"].url;
    if (thumbs["high"])
        return thumbs["high"].url;
    if (thumbs["medium"])
        return thumbs["medium"].url;
    if (thumbs["default"])
        return thumbs["default"].url;
    return "";
}

