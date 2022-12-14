/*
self.onmessage = ({ data: { question } }) => {
  self.postMessage({
    answer: 42,
  });
};
*/
// We are responsible for sorting the playlist here
// the playlist has already been placed in state, but unsorted
// now we will sort it and then update state

////// we know playlist is in state, but we can't guarantee that it is in local storage
////// so we need to take playlist from state
/*
SORT ALGO:
Push first 40 songs
use a custom comparator on the rest of the list
the custom comparator will just equally treat anything without db data as -infinity
How to make sort stable? we would have to consider index as well

if we call .sort(), it wont be stable,
We need a way to separate all those songs that don't have metrics
So, we walk through the rest of the list, and push those w/ metrics to one list and w/out to another list
then sort the metric list, then concat the 3 lists

this not an ideal algo bcuz those w/out metrics dont
necessarily deserve to be on the bottom
bcuz some with metrics might have negative score
*/

const INITIAL_LEN = 30;

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = (e) => {
    ///////// WE ARE GOING TO WANT TO STORE VIDEO DATA IN SESSION STORAGE AFTER ALL
    ///// WE NEED IT FOR START AND END TIMES....in which case we will have to adjust this algo
    ///// because we will instead be given an object item instead of just an index
    if (!e) return;
    let playlist = e?.data?.playlist;
    if (!playlist) return;
    let videoDict = e?.data?.videoData;
    let visited = {};
    ///////NOTE: we could get rid of dupe counting
    let dupes = 0;
    if (videoDict) {
        let list1 = [], list2 = [], list3 = [];

        // push first INITIAL_LEN songs 
        for (let i = 0; i < INITIAL_LEN && i < playlist.length; i++) {
            list1.push(playlist[i]);
        }
        // push those with metrics to list2 and those without to list3
        for (let i = INITIAL_LEN; i < playlist.length; i++) {
            let id = playlist[i]?.snippet?.resourceId?.videoId;

            // exclude dupes
            if (visited[id]) {
                ++dupes;
                continue;
            }
            visited[id] = true;
            if (videoDict[id] !== undefined) {
                list2.push(playlist[i]);
            } else {
                list3.push(playlist[i]);
            }
        }
        const comp = (a, b) => {
            let aId = a?.snippet?.resourceId?.videoId;
            let bId = b?.snippet?.resourceId?.videoId;
            let aNdx = videoDict[aId];
            let bNdx = videoDict[bId];
            return aNdx - bNdx;
        }
        // sort list2 with custom comparator based on sorted index from DB
        list2 = list2.sort(comp);
        console.log("SORTED LIST2", list2);
        // concat lists
        playlist = list1.concat(list2).concat(list3);
    }

    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({
        playlist: playlist,
        dupes: dupes,
    });
}
