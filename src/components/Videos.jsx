import * as React from "react";
import { useEffect } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import QueueIcon from '@mui/icons-material/Queue';
import { FixedSizeList } from "react-window";
import Button from 'react-bootstrap/Button';
import { useState } from "react";
import {
  Box,
} from '@mui/material';
import Loader from './Loader';

const HEIGHT_OFFSET = 79 + 206 + 90 + 80;
const Videos = ({ videos, curNdx, videoSelected, isQueue, pushToQueue, useMetrics, triggerReload }) => {
  const listRef = React.createRef();
  const [listWidth, setListWidth] = useState(isQueue ? 500 : 660);
  const [listHeight, setListHeight] = useState(document.documentElement.clientHeight - HEIGHT_OFFSET);

  useEffect(() => {
    setTimeout(windowSize, 500);
  }, []);

  useEffect(() => {
    windowSize();
  }, [triggerReload]);

  useEffect(() => {
    listRef?.current?.scrollToItem(0);
  }, [videos]);

  useEffect(() => {
    console.log("inside scrollToItem useEffect, curNdx" + curNdx)
    listRef?.current?.scrollToItem(curNdx);
    setTimeout(() => {
      listRef?.current?.scrollToItem(curNdx);
    }, 400);
  }, [curNdx]);

  if (!videos) return <div>Loading...</div>

  function windowSize() {
    document.querySelector(".main-stk div:nth-child(3)")?.classList.add("videos-root");
    if (isQueue) {
      if (document.documentElement.clientWidth < 1620) {
        setListWidth(document.documentElement.clientWidth / 2 - 350); // should probably use percentage
      }
      else {
        setListWidth(500);
      }
      setListHeight(document.documentElement.clientHeight - HEIGHT_OFFSET);
      return;
    }
    if (document.documentElement.clientWidth < 680) {
      setListWidth(document.documentElement.clientWidth - 20);
      // we decrease height at extreme low width because navbar stacks up high
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

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("clicked", e.target)

      // we for some reason can't just pass in the index here, it is always zero
      // climb up from the target so we can find the index
      let ndx = null, target = e.target;
      for (let i = 0; i < 4; ++i) {
        if (target.title) {
          ndx = target.title;
          break;
        }
        target = target.parentElement;
      }
      if (ndx === null) return;
      // if we hit svg or path, then we hit add to queue
      if (e.target.tagName.toLowerCase() === "svg" || e.target.tagName.toLowerCase() === "path") {
        pushToQueue(ndx, false); // false says this is not coming from queue, we disabled queue add on q items
      } else {
        videoSelected(ndx, isQueue);
      }
    }

    ////TODO: add a like button beneath queue
    return (
      <ListItem
        style={style}
        title={index} key={index} component="div" disablePadding divider={true} className="list-item"
      >
        <ListItemButton
          className="list-item-btn"
          selected={index === curNdx ? true : false}
          onClick={handleClick}
          title={index}
        >
          <div
            title={index} className="list-item-ndx">{`${index + 1}`}
          </div>
          <img
            title={index} src={`${thumbnail}`} className="list-item-img" alt="t" />

          <ListItemText
            title={index} primary={`${videos[index]?.snippet?.title}`} secondary={`${videos[index]?.snippet?.videoOwnerChannelTitle}`}
          />
          <QueueIcon className={`list-item-queue ${isQueue ? "hide" : ""}`} />
        </ListItemButton>
      </ListItem >
    );
  }

  return (<>
    {videos ? (
      <>
        <div className={`list-container ${isQueue ? "queue" : ""}`}>
          <Box
            sx={{ width: listWidth, height: listHeight, maxWidth: 820, paddingTop: '0' }}
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
            <div className="flex-center mt-2">
              <Button onClick={(e) => listRef.current.scrollToItem(curNdx)} className="btn1" variant="dark">SCROLL TO CURRENT SONG</Button>
            </div>
            <span className={`metrics-txt flex-center mt-2 ${isQueue ? "hide" : ""}`}>{useMetrics ? "METRICS ON" : "METRICS OFF"}</span>
          </Box>
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