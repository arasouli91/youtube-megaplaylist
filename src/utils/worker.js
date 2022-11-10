/*
self.onmessage = ({ data: { question } }) => {
  self.postMessage({
    answer: 42,
  });
};
*/

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = (e) => {
    if (!e) return;
    console.log('Message received from main script ', e);
    let playlist = e?.data?.playlist;
    if (!playlist) return;

    // map playlist to simplified version
    const resPlaylist = playlist.map((x) => {
        let thumb = findFirstThumbnail(x?.snippet?.thumbnails);
        return {
            snippet: {
                title: x?.snippet?.title,
                thumbnails: {
                    maxres: {
                        url: thumb
                    }
                },
                videoOwnerChannelTitle: x?.snippet?.videoOwnerChannelTitle,
                resourceId: {
                    videoId: x?.snippet?.resourceId?.videoId
                }
            }
        }
    });
    console.log("done processing playlist in worker postMessage");
    console.log(resPlaylist)
    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({
        playlist: resPlaylist,
    });

    // later we will also sort playlist here
}
// once you reach an element that has no .id
// we know that the rest was already previously processed

// we also want to prepare search results dict 
// and save the results to session storage
// probably with a different worker


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


/*
export const playlistWorker = (playlist) => {
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

    if (playlist) return [];
    console.log('Message received from main script ', playlist);

    // map playlist to simplified version
    const resPlaylist = playlist.map((x) => {
        // once you reach an element that has no .id
        // we know that the rest was already previously processed
        if (!x?.id) return x;

        let thumb = findFirstThumbnail(x?.snippet?.thumbnails);
        return {
            snippet: {
                title: x?.snippet?.title,
                thumbnails: {
                    maxres: {
                        url: thumb
                    }
                },
                channelTitle: x?.snippet?.videoOwnerChannelTitle,
                resourceId: {
                    videoId: x?.snippet?.resourceId?.videoId
                }
            }
        }
    });
    return resPlaylist;
    // later we will also sort playlist here
}

// we also want to prepare search results dict
// and save the results to session storage
export const prepareSearchDictionary = (playlist) => {

}

*/

