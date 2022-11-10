import React, { useState, useEffect } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

import { Videos, VideoDetail2, Loader } from '.';
import { youTubeFetch } from '../utils';


const Playlist = ({ random }) => {
  // id will either be incremented or random selected when a video finishes
  // or it will be chosen from list
  const [index, setIndex] = useState(0);/*
  const [videos, setVideos] = useState([
    { id: "3D1PNMMdjLI" }, { id: "2BoouwBLMdU" }, { id: "ubQ7jrZMiD4" }, { id: "2BoouwBLMdU" }, { id: "ubQ7jrZMiD4" }, { id: "2BoouwBLMdU" }, { id: "ubQ7jrZMiD4" }, { id: "2BoouwBLMdU" }, { id: "ubQ7jrZMiD4" }, { id: "2BoouwBLMdU" }, { id: "ubQ7jrZMiD4" }, { id: "2BoouwBLMdU" }, { id: "ubQ7jrZMiD4" }, { id: "2BoouwBLMdU" }, { id: "ubQ7jrZMiD4" }, { id: "2BoouwBLMdU" }, { id: "ubQ7jrZMiD4" }, { id: "3D1PNMMdjLI" }, { id: "3D1PNMMdjLI" }, { id: "2BoouwBLMdU" }, { id: "ubQ7jrZMiD4" }, { id: "3D1PNMMdjLI" }, { id: "3D1PNMMdjLI" }, { id: "2BoouwBLMdU" }, { id: "ubQ7jrZMiD4" }, { id: "3D1PNMMdjLI" }, { id: "3D1PNMMdjLI" }, { id: "2BoouwBLMdU" }, { id: "ubQ7jrZMiD4" }, { id: "3D1PNMMdjLI" },
  ]);*/
  const [videos, setVideos] = useState(null);
  const { searchTerm } = useParams();

  //// Initially fetch playlist 
  useEffect(() => {

    const fetchVids = async () => {
      let res = await youTubeFetch("PLmIkV2QRPyhkiEl9jxtKvpIRg50n0rfSj");
      setVideos(res)
      console.log(res)
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
  return (
    (videos ?
      <>
        <Typography
          fontSize={25}
          fontWeight={900}
          p={3}
          textAlign='center'
          color='white'
        >
          Search Results for {searchTerm} Videos
        </Typography>

        <Stack
          height={2000}
          direction={"column"}
          className='main-stk'>
          <VideoDetail2 video={videos[index].snippet} videoFinished={videoFinished} />
          <Box px={1} py={{ md: 1, xs: 5 }}>
            <Videos videos={videos} curNdx={index} videoSelected={videoSelected} direction='column' />
          </Box>
          {/*<Videos videos={videos} />*/}
        </Stack>
      </>
      : <Loader />));
};

export default Playlist;
