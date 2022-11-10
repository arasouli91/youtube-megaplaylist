import axios from 'axios';

let worker = new Worker(new URL('./worker.js', import.meta.url));
/*worker.onmessage = function (event) {
  console.log("RETURNED FROM WORKER")
  console.log(event);
}*//*
worker.onmessage = ({ data: { answer } }) => {
  console.log("RETURNED FROM WORKER")
  console.log(answer);
};
console.log(worker)
*/
/*
worker.postMessage({
  question:
    'The Answer to the Ultimate Question of Life, The Universe, and Everything.',
});*/

////////////TEST: FOR TESTING LET'S LEAVE THIS AT 1
const GET_NEW_LIST_THRESHOLD = 50; // needs to be 50 bcuz that's the most we return from one api call

const api_key = "AIzaSyCws-v3i9spF2CIAcS3tteO5ojWkQE9dmg";
//AIzaSyCp843L2L6YUCZDIIcjsefIseZ-w1Cm3pY  //proj1
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
          buildSearchDictionary(res);
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
  // compare total retrieved length with cached len
  if (res?.pageInfo?.totalResults - previousLength > GET_NEW_LIST_THRESHOLD) {
    return []; // go ahead and get entire remote, which will become the new cached
  }

  // add to cached playlist
  let cachedPlaylist = localStorage.getObj("playlist");
  let newPlaylist = [];
  let diff = remotePlaylist.length - previousLength;
  // take diff number of elements from remotePlaylist
  for (var i = 0; i < diff; ++i) {
    newPlaylist.push(remotePlaylist[i]);
  }
  newPlaylist = newPlaylist.concat(cachedPlaylist);

  return newPlaylist; // return the cached + new songs
}

// slim down playlist object and then cache it   ////later need to sort it also
const savePlaylist = (playlist) => {
  console.log("savePlaylist")

  worker.onmessage = ({ data: { playlist } }) => {
    console.log("RETURNED FROM WORKER")
    console.log(playlist);
    localStorage.setObj("playlist", playlist)
  };
  worker.postMessage({ playlist: playlist });
}

const buildSearchDictionary = (playlist) => {
  /*
    searchDictWorker.onmessage = ({ data: { dictionary } }) => {
      console.log("RETURNED FROM searchDictWorker")
      console.log(dictionary);
      /////// save to session store
      localStorage.setObj("playlist", playlist)
    };
    searchDictWorker.postMessage({ playlist: playlist });
    */
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
    'X-RapidAPI-Key': "dd06d9006amsh64cd2bd1911b91bp1d5797jsncfa82c34d726",// process.env.REACT_APP_RAPID_API_KEY,
    'X-RapidAPI-Host': 'youtube-v31.p.rapidapi.com',
  },
};//

export const axiosGetReq = async (url) => {
  const res = await axios.get(`${BASE_URL}/${url}`, options);
  return res.data;
};