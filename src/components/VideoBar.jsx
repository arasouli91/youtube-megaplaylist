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

// We sohuld only know about current video?
// If so, then we have to ask parent for next video every time video finishes
// We could instead, be given an array and an index
// but if we are managing index, the parent will want to know as well
// so let us just tell the parent everytime a video finishes

const VideoBar = ({ video, setChannel }) => {
  if (!video) <Loader />;

  const handleLikes = async (likes) => {
    await fetch(`/.netlify/functions/like?id=${video._id}&likes=${likes}`)
  }
  const skipSong = async () => {
    //////// we should call video selected with next index
  }
  const setEnd = async (likes) => {
    const end = -1; // idk how to get current time
    await fetch(`/.netlify/functions/setStartEnd?id=${video._id}&end=${end}`)
    skipSong();
  }
  const setStart = async () => {
    const start = -1; // idk how to get current time
    // maybe have to set time when song starts
    await fetch(`/.netlify/functions/setStartEnd?id=${video._id}&likes=${start}`)
  }
  const pushToQueue = async () => {
    ///// playlist should manage queue state, then we can go to a separate page
    ///// we have a top menu, which is owned by playlist
    ///// this will navigate us to queue page
    ////// or, it would be really cool if we could see the queue side by side
    //// with normal playlist, then we can just click into whichever we want
    //// amd continue to add to the queue, fuck that is so good!!!!
    //// we should have add to queue button on the songs themselves
    //// and probably want to have like/dislike on songs themselves
  }

  return (
    <>
      {video && (
        <>
          <div className='vid-bar'>
            <div className='vid-bar-item1'>
              {video?.title}
              {/*THIS SHOULD SET SEARCH TO CHANNEL TITLE*/}
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
                  sx={{ mr: '10px' }}
                  className="button"
                />
                <StartIcon
                  onClick={(e) => setStart()}
                  sx={{ mr: '10px' }}
                  className="button"
                />
                <KeyboardTabOutlinedIcon
                  onClick={(e) => setEnd()}
                  sx={{ mr: '10px' }}
                  className="button"
                />
                <SkipNextIcon
                  onClick={(e) => skipSong()}
                  sx={{ mr: '10px' }}
                  className="button"
                />
                <RecommendOutlinedIcon
                  onClick={(e) => handleLikes(6)}
                  sx={{ mr: '10px' }}
                  className="button"
                />
                <ThumbUpAltOutlinedIcon
                  onClick={(e) => handleLikes(1)}
                  sx={{ mr: '8px' }}
                  className="button"
                />
                <ThumbDownAltOutlinedIcon
                  onClick={(e) => handleLikes(-1)}
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
                    video?.likes
                  ).toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>
        </>)
      }
    </>
  );
};
/*
Do we want a side bar and a grid view?
Sounds good.
 
We will want to change thumbnails to be more like youtube playlist
 
 
*/

export default VideoBar;
