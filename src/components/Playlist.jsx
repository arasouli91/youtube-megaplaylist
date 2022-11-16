import React, { useState, useEffect } from 'react';
import { Stack, Box, duration } from '@mui/material';

import { Videos, VideoDetail2, Loader, VideoBar } from '.';
import { youTubeFetch, calculateSearchResults } from '../utils';
import { Navbar } from '.';
let sortWorker = new Worker(new URL('../utils/sortWorker.js', import.meta.url));


const Playlist = ({ random }) => {
  // id will either be incremented or random selected when a video finishes
  // or it will be chosen from list
  const [index, setIndex] = useState(0);
  const [videos, setVideos] = useState(null);
  const [VideoDetails, setVideoDetails] = useState(null);
  const [videoSubset, setVideoSubset] = useState(null);
  const [listSorted, setListSorted] = useState(false);
  const [videoData, setVideoData] = useState(null); // only really need to store this bcuz useeffect is not async

  //// Initially fetch playlist 
  useEffect(() => {

    const fetchVids = async () => {
      let res = await youTubeFetch("PLmIkV2QRPyhkiEl9jxtKvpIRg50n0rfSj");
      setVideos(res)
      console.log(res);
    };
    fetchVids();
  }, []);

  // fetch video data from our DB and sort playlist
  useEffect(() => {
    if (videos && !videoData) {
      console.log("NOW WE WILL BE SORTING THE VIDEOS");

      // fetch video data
      const fetchVidData = async () => {
        let data = await fetch("/.netlify/functions/videos").then(resp => resp.json());
        console.log("fetched videoData", data);
        setVideoData(data);
      };
      fetchVidData();
    }
    // wait for videoData to come back from the fetch, then we end up back in useEffect
    if (videoData && listSorted === false) {
      // run a web worker
      // update state from webworker onmessage
      sortWorker.onmessage = ({ data: { playlist } }) => {
        setVideos(playlist);
        setListSorted(true);
        console.log("set playlist after sort", playlist)
      };
      sortWorker.postMessage({ playlist: videos, videoData: videoData });
    }
  }, [videos, videoData /*sortWorker*/]);

  useEffect(() => {
    if (!videos && !videoSubset) return;
    // first decide what local details to pass into VideoBar by using index
    const videoPlaying = videoSubset ? videoSubset[index]?.snippet : videos[index]?.snippet;
    // set videoDetails state
    setVideoDetails(videoPlaying);
    // then, fetch other details and play video in DB
    const playVideo = async (videoPlaying) => {
      console.log("playVideo")
      let videoData = await fetch(`/.netlify/functions/playVideo?id=${videoPlaying?.resourceId?.videoId}`)
        .then(resp => resp.json());
      console.log("fetched videoDetails", videoData);
      // update vidoeDetails state again so that VideoBar rerenders
      setVideoDetails(Object.assign(videoPlaying,videoData));
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
        console.log("in timeout callback halftime,",halftime);
        console.log(`videodetails._id ${videoData._id}`);
        await fetch(`/.netlify/functions/checkVideoPlaying?id=${videoData._id}`)
      }, halftime);
    };
    playVideo(videoPlaying);
  }, [index])

  const videoFinished = () => {
    if (random) {
      // select random index
    } else {
      setIndex(index + 1);
    }
  }
  const videoSelected = (ndx) => {
    setIndex(ndx);
  }
  const searchHandler = (search) => {
    let res = calculateSearchResults(search);
    res = res.map((ndx) => videos[ndx]);
    if (res.length > 0) {
      setIndex(0);
      setVideoSubset(res);
    }
  }

  return (
    (videos ?
      <>
        <Navbar searchHandler={searchHandler} />
        <Stack
          height={2000}
          direction={"column"}
          className='main-stk'>
          <VideoDetail2
            video={videoSubset ? videoSubset[index].snippet : videos[index].snippet}
            videoFinished={videoFinished}
          />
          <VideoBar video={VideoDetails} setChannel={searchHandler} />
          <Box px={1} py={{ md: 1, xs: 5 }}>
            <Videos
              videos={videoSubset ? videoSubset : videos}
              curNdx={index} videoSelected={videoSelected}
            />
          </Box>
          {/*<Videos videos={videos} />*/}
        </Stack>
      </>
      : <Loader />));
};



export default Playlist;
