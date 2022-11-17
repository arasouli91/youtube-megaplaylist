import React from 'react';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import RecommendOutlinedIcon from '@mui/icons-material/RecommendOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import StartIcon from '@mui/icons-material/Start';
import KeyboardTabOutlinedIcon from '@mui/icons-material/KeyboardTabOutlined'; // set end here
import SkipNextIcon from '@mui/icons-material/SkipNext';
import QueueIcon from '@mui/icons-material/Queue';
import { Loader } from '.';
const root = process.env.REACT_APP_NETLIFY_ROOT ? process.env.REACT_APP_NETLIFY_ROOT : "";

// We sohuld only know about current video?
// If so, then we have to ask parent for next video every time video finishes
// We could instead, be given an array and an index
// but if we are managing index, the parent will want to know as well
// so let us just tell the parent everytime a video finishes

const SideBar = ({ video, addLikes }) => {
  if (!video) <Loader />;

  const handleLikes = async (likes) => {
    console.log("handleLikes", likes);
    console.log("video", video);
    /////TODO: we can't guarantee that video object has ._id
    addLikes(likes);
    await fetch(root + `/.netlify/functions/like?id=${video._id}&likes=${likes}`)
  }
  const skipSong = async () => {
    //////// we should call video selected with next index
  }
  const setEnd = async (likes) => {
    const end = -1; // idk how to get current time
    await fetch(root + `/.netlify/functions/setStartEnd?id=${video._id}&end=${end}`)
    skipSong();
  }
  const setStart = async () => {
    const start = -1; // idk how to get current time
    // maybe have to set time when song starts
    await fetch(root + `/.netlify/functions/setStartEnd?id=${video._id}&likes=${start}`)
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
          <div className=' side-bar'>
            <div className='side-bar-col side-bar-left'>
              <QueueIcon
                onClick={(e) => pushToQueue()}
                sx={{ mr: '5px', width: '120px', height: '120px' }}
                className="side-bar-btn"
              />
              <StartIcon
                onClick={(e) => setStart()}
                sx={{ mr: '5px', width: '120px', height: '120px' }}
                className="side-bar-btn"
              />
              <KeyboardTabOutlinedIcon
                onClick={(e) => setEnd()}
                sx={{ mr: '5px', width: '120px', height: '120px' }}
                className="side-bar-btn"
              />
              <SkipNextIcon
                onClick={(e) => skipSong()}
                sx={{ mr: '5px', width: '120px', height: '120px' }}
                className="side-bar-btn"
              />
            </div>
            <div className='side-bar-col side-bar-right'>
              <RecommendOutlinedIcon
                onClick={(e) => handleLikes(6)}
                sx={{ mr: '2px', width: '180px', height: '180px' }}
                className="side-bar-btn"
              />
              <ThumbUpAltOutlinedIcon
                onClick={(e) => handleLikes(1)}
                sx={{ mr: '2px', width: '180px', height: '180px' }}
                className="side-bar-btn"
              />
              <ThumbDownAltOutlinedIcon
                onClick={(e) => handleLikes(-2)}
                sx={{ mr: '2px', width: '180px', height: '180px' }}
                className="side-bar-btn"
              />
            </div>
          </div>
        </>)
      }
    </>
  );
};

export default SideBar;
