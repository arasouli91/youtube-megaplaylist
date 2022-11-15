import React from 'react';
import { Box, Stack } from '@mui/material';
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
