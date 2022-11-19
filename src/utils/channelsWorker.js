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

*/
const TOP_CHANNELS_LENGTH = 30;
let firstTry = true;
let api_key;
let api_key2;
let base_url = 'https://www.googleapis.com/youtube/v3/playlistItems?&part=snippet&playlistId=';
const netlifySaveApi = "";
const netlifyGetApi = "";

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = (e) => {
    if (!e) return;
    let playlist = e?.data?.playlist;
    if (!playlist) return;
    let apiKeys = e?.data?.apiKeys;
    if (!apiKeys) return;
    let cleanRun = e?.data?.cleanRun;
    let channelDict = {};

    const fetchDict = async (api) => {
        return await fetch(api).then(resp => resp.json());
    }
    const saveDict = async (api, body) => {
        return await fetch(api).then(resp => resp.json());
    }

    // subsequent runs: just return from DB
    if (!cleanRun) {
        // netlifyRes is unsorted list of objects
        let netlifyRes = fetchDict(netlifyGetApi);

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
    // { channel1: {count:count1}, channel2: {count:count2}, ...}
    // sort by count
    let channels = Object.keys(channelDict);
    channels = channels.sort((a, b) => channelDict[b].count - channelDict[a].count); //b-a is descending

    ////// INITIAL/CLEAN RUN: fetch all songs from youtube
    api_key = apiKeys[0];
    api_key2 = apiKeys[1];
    let res;
    if (cleanRun) {
        res = youTubeFetch();
        // map channel ids
        for (let i = 0; i < res.length; i++) {
            let channel = res.items[i]?.snippet?.videoOwnerChannelTitle;
            let id = res.items[i].snippet?.videoOwnerChannelId;
            if (channel) {
                if (channelDict[channel]) {
                    channelDict[channel] = { _id: channel, count: channelDict[channel], id: id }
                }
            }
        }
        // algorthm gets painful if we have to retrieve more than 50 ids
        // so get list of top 50 ids
        let ids = `${channelDict[channels[0]].id}`;
        for (let i = 1; i < 50; i++) {
            ids += "," + channelDict[channels[i]].id;
        }
        // fetch channels
        base_url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${ids}`;
        res = youTubeFetch(base_url);

        // map image to channel
        for (let i = 0; i < res.items.length; i++) {
            let channel = res.items[i]?.snippet?.videoOwnerChannelTitle;
            let thumb = findFirstThumbnail(res.items[i]?.snippet?.thumbnails);
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
    console.log("CHANNELSWORKER channelDict: " + channelDict);
    console.log("CHANNELSWORKER collection: " + collection)
    // upload to database, overwrite entire object
    console.log("CHANNELSWORKER save to db", JSON.stringify(collection));
    saveDict(netlifySaveApi, JSON.stringify(collection));

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

