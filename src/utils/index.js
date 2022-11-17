import axios from 'axios';

let worker = new Worker(new URL('./worker.js', import.meta.url));
let searchDictWorker = new Worker(new URL('./searchDictWorker.js', import.meta.url));

const SORT_LIST_THRESHOLD = 30; // this also exists in sortWorker as INITIAL_LEN
const GET_NEW_LIST_THRESHOLD = 50; // needs to be 50 bcuz that's the most we return from one api call
/////const GEN_SEARCH_DICT_THRESHOLD = 0;
/////if we dont always generate it then we can't search for songs that appear at top....

const api_key = process.env.REACT_APP_YOUTUBE_API_KEY1;
const youTubeFetchInner = async (playlist_id, page_token) => {
  try {
    const base_url = 'https://www.googleapis.com/youtube/v3';
    const config = {
      method: 'GET',
      mode: 'cors',
    };
    let url;

    /////TODO: We need to be able to switch yt api keys if one fails, factor it out
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
    let resObj = { res: [], shouldSort: true };
    let i = 0;
    while (i < 100) { // get up to 5K songs
      let partialRes = await youTubeFetchInner(playlist_id, pagetoken);
      // determine whether to take cached or get whole playlist from remote
      if (i === 0) {
        resObj = checkLocalCache(partialRes);
        if (resObj.res.length > 0) {
          console.log("return cached list,resObj", resObj)
          // either take local cache or take local cache with added videos diff
          return resObj;
        }
      }
      if (partialRes?.items) {
        resObj.res.push(...partialRes?.items);
      }
      pagetoken = partialRes?.nextPageToken;
      if (!pagetoken) {
        break;
      }
      ++i;
    }

    // returned whole remote playlist
    console.log("return remote list, resObj", resObj)
    // update prev len, going forward we compare against last time we fetched everything
    localStorage.setItem("prevLength", resObj.res.length);
    return resObj
  }
  catch (e) {
    throw new Error(e)
  }
}
// determine whether to take cached or get whole playlist, and determine whether not to sort
function checkLocalCache(res) {
  /// if local cache ends up with more than remote, then we might want to replace local cache bcuz it might be invalid

  let previousLength = localStorage.getItem("prevLength");
  console.log("previousLength", previousLength)
  let remotePlaylist = res?.items;
  let remotePlaylistLength = res?.pageInfo?.totalResults;
  let diff = remotePlaylistLength - previousLength;
  // if diff between prev cached length > threshold
  if (diff > GET_NEW_LIST_THRESHOLD) {
    return { res: [], shouldSort: true }; // go ahead and get entire remote, which will become the new cached
  }

  // add to cached playlist
  let cachedPlaylist = localStorage.getObj("playlist");
  let newPlaylist = [];
  // take diff number of elements from remotePlaylist
  for (var i = 0; i < diff; ++i) {
    newPlaylist.push(remotePlaylist[i]);
  }
  newPlaylist = newPlaylist.concat(cachedPlaylist);

  // return the cached + new songs. We should sort matching threshold of sortWorker otherwise it will discard some songs
  return { res: newPlaylist, shouldSort: diff > SORT_LIST_THRESHOLD };
}

// slim down playlist object and then cache it 
export const savePlaylist = (playlist) => {
  worker.onmessage = ({ data: { playlist } }) => {
    localStorage.setObj("playlist", playlist)
  };
  worker.postMessage({ playlist: playlist });
}

export const buildSearchDictionary = (playlist) => {
  searchDictWorker.onmessage = ({ data: { dict } }) => {
    sessionStorage.setObj("searchDict", dict)
  };
  searchDictWorker.postMessage({ playlist: playlist });
}

export const calculateSearchResults = (term) => {
  const dict = sessionStorage.getObj("searchDict")
  const words = term.split(' ');
  const ndxCounts = {};
  for (var k = 0; k < words.length; ++k) {
    let word = words[k].replace(/[^\w]/g, '');
    if (word.length === 0 || word === ' ') continue;
    word = word.toLowerCase();

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