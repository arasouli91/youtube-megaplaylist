onmessage = (e) => {
    if (!e) return;
    let playlist = e.data;
    console.log('Message received from main script ', e);

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
                channelTitle: x?.snippet?.videoOwnerChannelTitle,
                resourceId: {
                    videoId: x?.snippet?.resourceId?.videoId
                }
            }
        }
    });

    postMessage(resPlaylist);

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