import React, { useState, useEffect } from 'react';
import { Stack, Box } from '@mui/material';

import { Videos, VideoDetail2, Loader, VideoBar, SideBar } from '.';
import { youTubeFetch, calculateSearchResults, savePlaylist, buildSearchDictionary } from '../utils';
import { Navbar } from '.';

let channelsWorker = new Worker(new URL('../utils/channelsWorker.js', import.meta.url));
let sortWorker = new Worker(new URL('../utils/sortWorker.js', import.meta.url));
const root = process.env.REACT_APP_NETLIFY_ROOT ? process.env.REACT_APP_NETLIFY_ROOT : "";

const Playlist = () => {
  // id will either be incremented or random selected when a video finishes
  // or it will be chosen from list
  const [index, setIndex] = useState(0);
  const [random, setRandom] = useState(false);
  const [videos, setVideos] = useState(null);
  const [VideoDetails, setVideoDetails] = useState(null);
  const [videoSubset, setVideoSubset] = useState(null);
  const [listSorted, setListSorted] = useState(false);
  const [shouldSort, setShouldSort] = useState(false);
  // this is asynchronously loaded after the playlist and is used for sorting playlist
  const [videoData, setVideoData] = useState(null);
  const [triggerReload, setTriggerReload] = useState(null);
  const [channelThumbs, setChannelThumbs] = useState(null);
  const [sortedChannels, setSortedChannels] = useState(null);

  // Initially fetch playlist 
  useEffect(() => {

    const fetchVids = async () => {
      /////TODO: we will be adding a second playlist, or rather variable number of playlists
      let resObj = await youTubeFetch("PLmIkV2QRPyhkiEl9jxtKvpIRg50n0rfSj");
      setVideos(resObj.res)
      setShouldSort(resObj.shouldSort)
      playVideo(resObj.res[0].snippet)
      setChannelThumbs({}); // this will let fetch channel thumbs happen later, first we finish up here
      console.log(resObj);
    };
    fetchVids();
  }, []);

  // If playlist changes, Fetch video data from our DB and sort playlist
  useEffect(() => {
    console.log("videos or videoData changed")
    // fetch video data if it has not been fetched yet
    if (videos && !videoData) {
      console.log("  in first block")
      console.log("  fetch videoData from DB");

      // fetch video data 
      const fetchVidData = async () => {
        let data = await fetch(root + "/.netlify/functions/videos").then(resp => resp.json());
        console.log("fetched videoData", data);
        setVideoData(data);
      };
      fetchVidData();
    }
    // wait for videoData to come back from the fetch, then we end up back in useEffect
    if (videoData && listSorted === false) {
      console.log("  in second block")
      if (shouldSort) {
        console.log("  call sortWorker to sort playlist")
        // update state from webworker onmessage
        sortWorker.onmessage = ({ data: { playlist } }) => {
          setVideos(playlist);
          setListSorted(true);
          console.log("   set and cache playlist after sort", playlist)
          savePlaylist(playlist);
          console.log("  build search dictionary")
          buildSearchDictionary(playlist);
        };
        sortWorker.postMessage({ playlist: videos, videoData: videoData });
        ///// save to local storage
      } else {
        console.log("  don't sort, just retrieve from local storage")
        console.log("  build search dictionary")
        buildSearchDictionary(videos);
      }
    }
    console.log(`index ${index}`);
  }, [videos, videoData /*sortWorker*/]);

  const playVideo = async (videoPlaying) => {
    console.log("playVideo")
    // first decide what local details to pass into VideoBar by using index
    console.log("videoPlaying set video details", videoPlaying);
    // set videoDetails state
    setVideoDetails(videoPlaying);
    // then, fetch other details and play video in DB
    let videoData = await fetch(root + `/.netlify/functions/playVideo?id=${videoPlaying?.resourceId?.videoId}`)
      .then(resp => resp.json());
    console.log("fetched videoDetails", videoData);
    // update vidoeDetails state again so that VideoBar rerenders
    const vid = Object.assign(videoPlaying, videoData)
    setVideoDetails(vid);
    setTriggerReload(triggerReload ? false : true);
    //// ALL START/END TIME INFO ACTUALLY NEEDS TO COME INITIALLY if we want to actually apply to the video player
    // we want to take -1 so that we can avoid passing extra params to video player
    //// we can probably put all this in session storage
    /*
    const start = VideoDetails.start > 0 ? VideoDetails.start : -1;
    const end = VideoDetails.end > 0 ? (VideoDetails.end < VideoDetails.duration ? VideoDetails.end : -1) : -1;
    */
    const start = videoData.start > 0 ? videoData.start : 0;
    const end = videoData.end > 0
      ? (videoData.end < videoData.duration ? videoData.end : videoData.duration)
      : videoData.duration;
    console.log(`start ${start}, end ${end}`);
    const halftime = Math.floor((end - start) / 2) * 1000; // half and convert to ms
    // set timeout to check if song is still playing after 50% of duration
    console.log(`halftime ${halftime}`);
    setTimeout(async () => {
      console.log("in timeout callback halftime,", halftime);
      console.log(`videodetails._id ${videoData._id}`);
      await fetch(root + `/.netlify/functions/checkVideoPlaying?id=${videoData._id}`)
    }, halftime);
  }

  useEffect(() => {
    console.log("index changed", index)
    if (!videos && !videoSubset) return;
    console.log(" video at index", videos[index]);
    const videoPlaying = videoSubset ? videoSubset[index]?.snippet : videos[index]?.snippet;
    playVideo(videoPlaying);
  }, [index])

  // use this to fetch channelThumbs, it will be initiated by setting channelThumbs to {}
  useEffect(() => {
    if (!channelThumbs || Object.keys(channelThumbs).length > 0) return;
    console.log("channelThumbs", channelThumbs);
    // first check session
    const dict = sessionStorage.getObj("channelThumbs");
    const sortedChannels = sessionStorage.getObj("sortedChannels");

    // not in session storage
    if (!dict || !sortedChannels || sortedChannels.length === 0 || Object.keys(dict).length === 0) {
      console.log("NOT IN SESSION STORAGE")
      channelsWorker.onmessage = ({ data: { sortedList, channelDict } }) => {
        sessionStorage.setObj("channelThumbs", channelDict)
        sessionStorage.setObj("sortedChannels", sortedList)
        console.log("channelThumbs", sortedList);
        console.log("channelThumbs", channelDict);

        setChannelThumbs(channelDict);
        setSortedChannels(sortedList);
      };
      channelsWorker.postMessage({
        playlist: videos,
        apiKeys: [process.env.REACT_APP_YOUTUBE_API_KEY1, process.env.REACT_APP_YOUTUBE_API_KEY2],
        cleanRun: false, ////////TODO: We don't want to always do clean run, maybe make a menu option to recalculate top channels
        root: root
      });
      console.log(typeof (channelDict))
    } else {
      console.log("channelThumbs dict", dict);
      console.log("channelThumbs sortedChannels", sortedChannels);
      setChannelThumbs(dict);
      setSortedChannels(sortedChannels);
    }
  }, [channelThumbs]);


  const videoFinished = () => {
    if (random) {
      //////prevent same index twice?
      const mod = videoSubset ? videoSubset.length : videos.length;
      let randomNdx = (Math.random() * 100000) % mod;
      console.log("video finished, index", index + 1);
      console.log(parseInt(randomNdx))
      console.log("video at index", videos[parseInt(randomNdx)])
      setIndex(parseInt(randomNdx));
    } else {
      console.log("video finished, index", index + 1);
      console.log("video at index", videos[index + 1])
      setIndex(parseInt(index) + 1);
    }
  }
  const videoSelected = (ndx) => {
    setIndex(parseInt(ndx));
  }
  const searchHandler = (search) => {
    if (!search || search === "") {
      setVideoSubset(null);
      return;
    }
    let res = calculateSearchResults(search);
    res = res.map((ndx) => videos[ndx]);
    setIndex(0);
    if (res.length > 0) {
      setVideoSubset(res);
      playVideo(res[0].snippet);
    } else {
      setVideoSubset(null);
      playVideo(videos[0].snippet);
    }
  }

  const addLikes = (likes) => {
    VideoDetails.likes += likes;
    setVideoDetails(VideoDetails);
    setTriggerReload(triggerReload ? false : true);
  }
  const randomChanged = () => {
    console.log("set random", !random)
    setRandom(!random);
  }

  return (
    (videos ?
      <>
        <Navbar searchHandler={searchHandler} setRandom={randomChanged} random={random} channels={sortedChannels} />
        <Stack
          height={2000}
          direction={"column"}
          className='main-stk'>
          <VideoDetail2
            video={videoSubset ? videoSubset[index].snippet : videos[index].snippet}
            videoFinished={videoFinished}
          />
          <VideoBar video={VideoDetails} setChannel={searchHandler} triggerReload={triggerReload} skip={videoFinished} />
          <Box className='bottom-half' px={1} py={{ md: 1, xs: 5 }}>
            <div className='left-side-of-playlist'>
            </div>
            <Videos
              videos={videoSubset ? videoSubset : videos}
              curNdx={index} videoSelected={videoSelected}
            />
            <SideBar video={VideoDetails} addLikes={addLikes} />
          </Box>
          {/*<Videos videos={videos} />*/}
        </Stack>
      </>
      : <Loader />));
};



export default Playlist;
