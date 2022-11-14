import React, { useState, useEffect } from 'react';
import { Stack, Box } from '@mui/material';

import { Videos, VideoDetail2, Loader } from '.';
import { youTubeFetch, calculateSearchResults } from '../utils';
import { Navbar } from '.';
let sortWorker = new Worker(new URL('../utils/sortWorker.js', import.meta.url));


const Playlist = ({ random }) => {
  // id will either be incremented or random selected when a video finishes
  // or it will be chosen from list
  const [index, setIndex] = useState(0);
  const [videos, setVideos] = useState(null);
  const [videoSubset, setVideoSubset] = useState(null);
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
        console.log(data);
        setVideoData(data);
      };
    }
    // wait for videoData to come back from the fetch, then we end up back in useEffect
      if(videoData){
        // run a web worker
        // update state from webworker onmessage
        sortWorker.onmessage = ({ data: { playlist } }) => {
          setVideos(playlist);
        };
        sortWorker.postMessage({ playlist: videos, videoData: videoData });

      }
    // i mean, like there are other cases when videos will update and then we end up here
    // videos update cases: Init,
    // wont update on: random mode
    // wont update on search either because we take a sublist on sort

    // think about this tho, the search dictionary either needs to be generated twice 
    // or it needs to wait for us to sort the playlist in the first place <---- yes let's do that 

  }, [videos, videoData /*sortWorker*/]);

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
          <VideoDetail2 video={videoSubset ? videoSubset[index].snippet : videos[index].snippet} videoFinished={videoFinished} />
          <Box px={1} py={{ md: 1, xs: 5 }}>
            <Videos videos={videoSubset ? videoSubset : videos} curNdx={index} videoSelected={videoSelected} direction='column' />
          </Box>
          {/*<Videos videos={videos} />*/}
        </Stack>
      </>
      : <Loader />));
};



export default Playlist;
