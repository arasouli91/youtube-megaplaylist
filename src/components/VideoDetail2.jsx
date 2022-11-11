import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Box, Stack } from '@mui/material';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import YouTube from "react-youtube";
import { useState } from "react";
import { Loader } from '.';

// We sohuld only know about current video?
// If so, then we have to ask parent for next video every time video finishes
// We could instead, be given an array and an index
// but if we are managing index, the parent will want to know as well
// so let us just tell the parent everytime a video finishes

const VideoDetail2 = ({ video, videoFinished }) => {
  if (!video) <Loader />;
  const [width, setWidth] = useState(document.documentElement.clientWidth);

  function displayWindowSize() {
    setWidth(document.documentElement.clientWidth);
    console.log(`update width: ${document.documentElement.clientWidth}`)
  }

  // Attaching the event listener function to window's resize event
  window.addEventListener("resize", displayWindowSize);

  const opts = {
    height: "200",
    width: width - 26,
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1
    }
  };
  return (
    <>
      {video && (
        <>
          <Stack
            sx={{}}
            direction={{ xs: 'column', md: 'row' }}
          >
            <Box flex={1}>
              <Box sx={{ width: '100%', position: 'sticky', top: '100px' }}>

                <YouTube
                  videoId={video?.resourceId?.videoId}
                  opts={opts}
                  onEnd={(e) => videoFinished(e)}
                />

                <Typography color='#fff' fontSize={18} fontWeight={500} p={1.5}>
                  {video?.title}
                </Typography>
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  gap='40px'
                  sx={{ color: '#fff' }}
                >
                  <Link to={`/channel/${video?.channelId}`}>
                    <Typography
                      fontSize={{ md: 20, xs: 16 }}
                      fontWeight={600}
                      mx={{ md: 2, xs: 0 }}
                      color='#fff'
                    >
                      {video?.channelTitle}
                      <CheckCircleIcon
                        sx={{ fontSize: '12px', color: 'gray', ml: '5px' }}
                      />
                    </Typography>
                  </Link>
                  <Stack direction='row' gap='20px' alignItems='center'>
                    <Typography
                      sx={{ opacity: 0.7, fontSize: { md: '16px', xs: '14px' } }}
                    >
                      {parseInt(
                        video?.viewCount
                      ).toLocaleString('en-US')}{' '}
                      views
                    </Typography>

                    <Stack
                      direction='row'
                      alignItems='center'
                      gap='10px'
                      sx={{ opacity: 0.7, fontSize: { md: '16px', xs: '14px' } }}
                    >
                      <ThumbUpAltOutlinedIcon />
                      <span>
                        {parseInt(
                          video?.likeCount
                        ).toLocaleString('en-US')}
                      </span>
                    </Stack>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </>
      )
      }
    </>
  );
};
/*
Do we want a side bar and a grid view?
Sounds good.

We will want to change thumbnails to be more like youtube playlist


*/

export default VideoDetail2;
