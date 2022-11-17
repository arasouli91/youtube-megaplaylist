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

const HEIGHT_OFFSET = 79 + 206 + 90 + 80;
const Videos = ({ videos, curNdx, videoSelected }) => {
  const listRef = React.createRef();
  const [listWidth, setListWidth] = useState(660);
  const [listHeight, setListHeight] = useState(document.documentElement.clientHeight - HEIGHT_OFFSET);
  useEffect(() => {
    listRef?.current?.scrollToItem(curNdx);
    setTimeout(() => {
      listRef?.current?.scrollToItem(curNdx);
    }, 400);
  }, [curNdx, listRef]);

  if (!videos) return <div>Loading...</div>

  function windowSize() {
    document.querySelector(".main-stk div:nth-child(3)")?.classList.add("videos-root");
    if (document.documentElement.clientWidth < 680) {
      setListWidth(document.documentElement.clientWidth - 20);
      if (document.documentElement.clientWidth < 340)
        setListHeight(document.documentElement.clientHeight - HEIGHT_OFFSET - 250);
      else
        setListHeight(document.documentElement.clientHeight - HEIGHT_OFFSET - 80);
    }
    else {
      setListWidth(660);
      setListHeight(document.documentElement.clientHeight - HEIGHT_OFFSET);
    }
  }

  // Attaching the event listener function to window's resize event
  window.addEventListener("resize", windowSize);

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
        <div className="list-container">
          <Box
            sx={{ width: '100%', height: { listHeight }, maxWidth: 820, paddingTop: '0' }}
            className={"list"}
          >
            <FixedSizeList
              ref={listRef}
              height={listHeight}
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