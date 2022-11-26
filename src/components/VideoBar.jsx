import React from 'react';
import { Typography } from '@mui/material';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import RecommendOutlinedIcon from '@mui/icons-material/RecommendOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import StartIcon from '@mui/icons-material/Start';
import KeyboardTabOutlinedIcon from '@mui/icons-material/KeyboardTabOutlined'; // set end here
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QueueIcon from '@mui/icons-material/Queue';
import { Loader } from '.';
import { useEffect, useState } from 'react';
const root = process.env.REACT_APP_NETLIFY_ROOT ? process.env.REACT_APP_NETLIFY_ROOT : "";

// We sohuld only know about current video?
// If so, then we have to ask parent for next video every time video finishes
// We could instead, be given an array and an index
// but if we are managing index, the parent will want to know as well
// so let us just tell the parent everytime a video finishes

const VideoBar = ({ video, setChannel, skip, pushToQueue }) => {
  if (!video) <Loader />;
  const [localLikes, setLocalLikes] = useState(video?.likes);

  useEffect(() => {
    console.log("videobar: video changed", video);
    setLocalLikes(video?.likes)
  }, [video?.likes]);


  const handleLikes = async (likes) => {
    setLocalLikes(localLikes + likes);
    await fetch(root + `/.netlify/functions/like?id=${video.resourceId.videoId}&likes=${likes}`)
  }
  const setEnd = async (likes) => {
    const end = -1; // idk how to get current time
    await fetch(root + `/.netlify/functions/setStartEnd?id=${video.resourceId.videoId}&end=${end}`)
    skip();
  }
  const setStart = async () => {
    const start = -1; // idk how to get current time
    // maybe have to set time when song starts
    await fetch(root + `/.netlify/functions/setStartEnd?id=${video.resourceId.videoId}&likes=${start}`)
  }

  //// we should have add to queue button on the songs themselves
  //// and probably want to have like/dislike on songs themselves
  return (
    <>
      {video && (
        <>
          <div className='vid-bar'>
            <div className='vid-bar-item1'>
              {video?.title}
              {/*THIS SETS SEARCH TO CHANNEL TITLE*/}
              <div className='vid-bar-link'
                onClick={(e) => setChannel(video?.videoOwnerChannelTitle)}>
                {video?.videoOwnerChannelTitle}
                <CheckCircleIcon
                  sx={{ fontSize: '12px', color: 'gray', ml: '5px', mb: '5px' }}
                />
              </div>
            </div>
            <div>
              <div className='vid-bar-top'>
                <QueueIcon
                  onClick={(e) => pushToQueue()}
                  sx={{ mr: '10px', width: '34px', height: '34px' }}
                  className="button"
                />
                <StartIcon
                  onClick={(e) => setStart()}
                  sx={{ mr: '10px', width: '34px', height: '34px' }}
                  className="button"
                />
                <KeyboardTabOutlinedIcon
                  onClick={(e) => setEnd()}
                  sx={{ mr: '10px', width: '34px', height: '34px' }}
                  className="button"
                />
                <SkipNextIcon
                  onClick={(e) => skip()}
                  sx={{ mr: '10px', width: '34px', height: '34px' }}
                  className="button"
                />
                <RecommendOutlinedIcon
                  onClick={(e) => handleLikes(6)}
                  sx={{ mr: '10px', width: '34px', height: '34px' }}
                  className="button"
                />
                <ThumbUpAltOutlinedIcon
                  onClick={(e) => handleLikes(1)}
                  sx={{ mr: '8px', width: '34px', height: '34px' }}
                  className="button"
                />
                <ThumbDownAltOutlinedIcon
                  onClick={(e) => handleLikes(-2)}
                  sx={{ width: '34px', height: '34px' }}
                  className="button"
                />
              </div>
              <div className='vid-bar-bottom'>
                <Typography
                  sx={{ opacity: 0.7, mr: '4px', fontSize: { md: '16px', xs: '14px' } }}
                  className="vid-bar-item1"
                >
                  {parseInt(
                    video?.plays
                  ).toLocaleString('en-US')}{' '}
                  plays
                </Typography>
                <span>
                  {parseInt(
                    localLikes
                  ).toLocaleString('en-US')}{' '}
                  likes
                </span>
              </div>
            </div>
          </div>
        </>)
      }
    </>
  );
};

export default VideoBar;
