/* eslint-disable-next-line no-restricted-globals */
self.onmessage = (e) => {
    if (!e) return;
    let playlist = e?.data?.playlist;
    if (!playlist) return;

    console.log("searchDictWorker: playlist: " + playlist)
    // map each word in each title to a list of indices
    let dict = {};
    playlist.forEach((x, i) => {
        let title = x?.snippet?.title;
        let words = title.split(' ');
        for (var k = 0; k < words.length; ++k) {
            let word = words[k].replace(/[^\w]/g, '');
            if (word.length === 0 || word === ' ') continue;
            word = word.toLowerCase();
            if (!dict[word]) {
                dict[word] = {};
            }
            dict[word][i] = true;
        }
        // map channel name to list of indices as well
        let channel = x?.snippet?.videoOwnerChannelTitle;
        if (channel) {
            words = channel.split(' ');
            for (k = 0; k < words.length; ++k) {
                let word = words[k].replace(/[^\w]/g, '');
                if (word.length === 0 || word === ' ') continue;
                word = word.toLowerCase();
                if (!dict[word]) {
                    dict[word] = {};
                }
                dict[word][i] = true;
            }
        }
    });

    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({
        dict: dict,
    });
}