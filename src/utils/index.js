import axios from 'axios';

let worker = new Worker(new URL('./worker.js', import.meta.url));
let searchDictWorker = new Worker(new URL('./searchDictWorker.js', import.meta.url));

const GET_NEW_LIST_THRESHOLD = 50; // needs to be 50 bcuz that's the most we return from one api call
const GEN_SEARCH_DICT_THRESHOLD = 1; ///////////NOTE: THIS SHOULD BE 8

const api_key = process.env.REACT_APP_YOUTUBE_API_KEY1;
const youTubeFetchInner = async (playlist_id, page_token) => {
  try {
    const base_url = 'https://www.googleapis.com/youtube/v3';
    const config = {
      method: 'GET',
      mode: 'cors',
    };
    let url;
    if (page_token) {
      url = `${base_url}/playlistItems?&part=snippet&playlistId=${playlist_id}&pageToken=${page_token}&maxResults=50&key=${api_key}`;
    }
    else {
      url = `${base_url}/playlistItems?&part=snippet&playlistId=${playlist_id}&maxResults=50&key=${api_key}`;
    }

    const result = await fetch(url, config);
    if (result.status !== 200) {
      return Promise.reject(result.error);
    }
    return await result.json();
  }
  catch (e) {
    throw new Error(e)
  }
}

//////// TODO:
/// Keep playlist1 stored, only retrieve it if it is not in localStorage
/// basically just do the same algo we have here, but only for playlist2
/// if for any reason we see that our cached playlist is less than 5000, then we know that it's time to get playlist1 again
export const youTubeFetch = async (playlist_id) => {
  // keep getting next page token and concatenating results
  try {
    let pagetoken = null;
    let res = [];
    let i = 0;
    while (i < 100) { // get up to 5K songs
      let partialRes = await youTubeFetchInner(playlist_id, pagetoken);
      // determine whether to take cached or get whole playlist from remote
      if (i === 0) {
        res = checkLocalCache(partialRes);
        if (res.length > 0) {
          console.log("return cached list")
          // either take local cache or take local cache with added videos diff
          return res;
        }
      }
      if (partialRes?.items) {
        res.push(...partialRes?.items);
      }
      pagetoken = partialRes?.nextPageToken;
      if (!pagetoken) {
        break;
      }
      ++i;
    }

    // update prev length, after caching playlist, we want to move forward comparing against that last cached length
    localStorage.setItem("prevLength", res.length);

    // let worker deal with storing the playlist to local storage
    savePlaylist(res); // we got all from remote, now cache it

    buildSearchDictionary(res);

    // returned whole remote playlist
    console.log("return remote list")
    return res;
  }
  catch (e) {
    throw new Error(e)
  }
}
function checkLocalCache(res) {
  /// if local cache ends up with more than remote, then we might want to replace local cache bcuz it might be invalid

  let previousLength = localStorage.getItem("prevLength");
  let remotePlaylist = res?.items;
  let remotePlaylistLength = res?.pageInfo?.totalResults;
  let diff = remotePlaylistLength - previousLength;
  // if diff between prev cached length > threshold
  if (diff > GET_NEW_LIST_THRESHOLD) {
    return []; // go ahead and get entire remote, which will become the new cached
  }

  // add to cached playlist
  let cachedPlaylist = localStorage.getObj("playlist");
  let newPlaylist = [];
  // take diff number of elements from remotePlaylist
  for (var i = 0; i < diff; ++i) {
    newPlaylist.push(remotePlaylist[i]);
  }
  newPlaylist = newPlaylist.concat(cachedPlaylist);

  if (diff > GEN_SEARCH_DICT_THRESHOLD || !sessionStorage.getItem("searchDict")) {
    buildSearchDictionary(newPlaylist);
  }

  return newPlaylist; // return the cached + new songs
}

// slim down playlist object and then cache it   ////later need to sort it also
const savePlaylist = (playlist) => {
  worker.onmessage = ({ data: { playlist } }) => {
    localStorage.setObj("playlist", playlist)
  };
  worker.postMessage({ playlist: playlist });
}

/////////TODO: AFTER WE IMPLEMENT SORTING,
///////// WE WILL NEED TO CALL THIS AFTER SORTING THE LIST
///////// BCUZ THE DICTIONARY WILL USE INDICES
///////// if this is too inconvenient, then after sorting map names to indices
const buildSearchDictionary = (playlist) => {
  searchDictWorker.onmessage = ({ data: { dict } }) => {
    console.log("returned from worker", dict);
    sessionStorage.setObj("searchDict", dict)
  };
  searchDictWorker.postMessage({ playlist: playlist });
}

export const calculateSearchResults = (term) => {
  console.log("calc results", term)
  const dict = sessionStorage.getObj("searchDict")
  const words = term.split(' ');
  const ndxCounts = {};
  console.log(dict)
  for (var k = 0; k < words.length; ++k) {
    let word = words[k].replace(/[^\w]/g, '');
    if (word.length === 0 || word === ' ') continue;
    word = word.toLowerCase();

    console.log("word dict[word]", word, dict[word])
    if (dict[word]) {
      // for each index that maps to this word, count it
      Object.keys(dict[word]).forEach((ndx) => {
        // count index
        if (!ndxCounts[ndx]) {
          ndxCounts[ndx] = 1;
        } else {
          ndxCounts[ndx]++;
        }
      });
    }
  }

  return Object.keys(ndxCounts).sort((a, b) => ndxCounts[b] - ndxCounts[a])
}



/////TODO:
export const reportDeletedVideos = () => {
  // basically do the same type of fetching above
  // do it for both playlists
  // just check if title is "Deleted video" or "Private video"
  // then get the id from
  // snippet.resourceId.videoId //// i think it is there
}

Storage.prototype.setObj = function (key, obj) {
  return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function (key) {
  return JSON.parse(this.getItem(key))
}



export const BASE_URL = 'https://youtube-v31.p.rapidapi.com';
export const options = {
  params: {
    maxResults: 50,
  },
  headers: {
    'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
    'X-RapidAPI-Host': 'youtube-v31.p.rapidapi.com',
  },
};

export const axiosGetReq = async (url) => {
  const res = await axios.get(`${BASE_URL}/${url}`, options);
  return res.data;
};