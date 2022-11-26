import React from 'react';
import { Box, Stack } from '@mui/material';
import YouTube from "react-youtube";
import { useState, useEffect } from "react";
import { Loader } from '.';

const VideoPlayer = ({ video, videoFinished }) => {
  if (!video) <Loader />;
  const [width, setWidth] = useState(document.documentElement.clientWidth);
  // no, there isn't actually a percentage that makes the height appropriate across resolutions
  const [height, setHeight] = useState(document.documentElement.clientHeight * .15);

  useEffect(() => {
    setTimeout(displayWindowSize, 800);
  }, []);

  function displayWindowSize() {
    setWidth(document.documentElement.clientWidth);
  }

  // Attaching the event listener function to window's resize event
  window.addEventListener("resize", displayWindowSize);

  const opts = {
    height: 200,
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
              </Box>
            </Box>
          </Stack>
        </>
      )
      }
    </>
  );
};

export default VideoPlayer;
