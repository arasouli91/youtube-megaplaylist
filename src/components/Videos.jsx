import * as React from "react";
import { useEffect } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList } from "react-window";
import Button from 'react-bootstrap/Button';
import { useState } from "react";
import {
  Box,
} from '@mui/material';
import Loader from './Loader';


const Videos = ({ videos, curNdx, videoSelected }) => {
  const listRef = React.createRef();
  const [listWidth, setListWidth] = useState(660);

  useEffect(() => {
    listRef.current.scrollToItem(curNdx);
    setTimeout(() => {
      listRef.current.scrollToItem(curNdx);
    }, 400);
  }, [curNdx, listRef]);

  if (!videos) return <div>Loading...</div>

  function displayWindowSize() {
    document.querySelector(".main-stk div:nth-child(3)")?.classList.add("videos-root");
    if (document.documentElement.clientWidth < 680) {
      setListWidth(document.documentElement.clientWidth - 20);
    }
    else {
      setListWidth(660);
    }
  }

  // Attaching the event listener function to window's resize event
  window.addEventListener("resize", displayWindowSize);

  function renderRow(props) {
    const { index, style } = props;

    const thumbnail = findFirstThumbnail(videos[index]?.snippet?.thumbnails)

    /*
    //TODO:WHAT ARE WE GOING TO DO WITH THESE DELETED VIDEOS? WHAT DO THEY DO IN AUTOPLAY?
    if (videos[index]?.snippet?.title === "Deleted video")
      console.log(videos[index])*/

    const handleSelect = (e) => {
      // we for some reason can't just pass in the index here, it is always zero
      // depending on what the target is, we can find the index
      if (e.target.title) {
        videoSelected(e.target.title);
      } else if (e.target.parentElement.title) {
        videoSelected(e.target.parentElement.title);
      } else {
        videoSelected(0);
      }
    }
    return (
      <ListItem
        style={style}
        title={index} key={index} component="div" disablePadding divider={true} className="list-item"
      >
        <ListItemButton
          className="list-item-btn"
          selected={index === curNdx ? true : false}
          onClick={handleSelect}
          title={index}
        >
          <div
            title={index} className="list-item-ndx">{`${index + 1}`}
          </div>
          <img
            title={index} src={`${thumbnail}`} className="list-item-img" alt="t" />

          <ListItemText
            title={index} primary={`${videos[index]?.snippet?.title}`} secondary={`${videos[index]?.snippet?.videoOwnerChannelTitle}`} />
        </ListItemButton>
      </ListItem >
    );
  }

  return (<>
    {videos ? (
      <>
        <Box
          sx={{ width: '100%', height: 800, maxWidth: 820, paddingTop: '0' }}
          className={"list"}
        >
          <FixedSizeList
            ref={listRef}
            height={800}
            width={listWidth}
            itemSize={90}
            itemCount={videos.length}
            overscanCount={25}
          >
            {renderRow}
          </FixedSizeList>
        </Box>
        <div className="flex-center mt-2">
          <Button onClick={(e) => listRef.current.scrollToItem(curNdx)} className="btn1" variant="dark">SCROLL TO CURRENT SONG</Button>
        </div>
      </>
    ) : (
      <Loader />
    )}
  </>);
}

export default Videos;



function findFirstThumbnail(thumbs) {
  if (thumbs === null) {
    return "";
  }
  if (thumbs["maxres"])
    return thumbs["maxres"].url;
  if (thumbs["standard"])
    return thumbs["standard"].url;
  if (thumbs["high"])
    return thumbs["high"].url;
  if (thumbs["medium"])
    return thumbs["medium"].url;
  if (thumbs["default"])
    return thumbs["default"].url;
  return "";
}