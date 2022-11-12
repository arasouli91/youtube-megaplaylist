import React, { useState, useEffect } from 'react';
import { Stack, Box } from '@mui/material';

import { Videos, VideoDetail2, Loader } from '.';
import { youTubeFetch, calculateSearchResults } from '../utils';
import { Navbar } from '.';


const Playlist = ({ random }) => {
  // id will either be incremented or random selected when a video finishes
  // or it will be chosen from list
  const [index, setIndex] = useState(0);
  const [videos, setVideos] = useState(null);
  const [videoSubset, setVideoSubset] = useState(null);

  //// Initially fetch playlist 
  useEffect(() => {

    const fetchVids = async () => {
      let res = await youTubeFetch("PLmIkV2QRPyhkiEl9jxtKvpIRg50n0rfSj");
      setVideos(res)
      console.log(res);
      let resp = await fetch("https://youtube-megaplaylist.netlify.app/.netlify/functions/videos");
      let videoData = await resp.json();
      console.log(videoData);
    };
    fetchVids();



  }, []);

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
