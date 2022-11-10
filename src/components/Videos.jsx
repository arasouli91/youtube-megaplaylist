import * as React from "react";
import { useEffect } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList } from "react-window";
import {
  Box,
} from '@mui/material';
import Loader from './Loader';


const Videos = ({ videos, curNdx, direction, videoSelected }) => {
  const listRef = React.createRef();

  useEffect(() => {
    if (curNdx)
      listRef.current.scrollToItem(curNdx);
  }, [curNdx, listRef]); ////NOTE: we added listRef, not sure if it will fuck up functionality

  if (!videos) return <div>Loading...</div>

  function renderRow(props) {
    const { index, style } = props;

    const thumbnail = findFirstThumbnail(videos[index]?.snippet?.thumbnails)

    /*
    ///////WHAT ARE WE GOING TO DO WITH THESE DELETED VIDEOS?
    //////WHAT DO THEY DO IN AUTOPLAY?
    if (videos[index]?.snippet?.title === "Deleted video")
      console.log(videos[index])
*/

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
            title={index} className="list-item-ndx">{`${index + 1}`}</div>

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
      <Box
        sx={{ width: '100%', height: 800, maxWidth: 820 }}
        className={"list"}
      >
        <FixedSizeList
          ref={listRef}
          height={800}
          width={660}
          itemSize={90}
          itemCount={videos.length}
          overscanCount={25}
        >
          {renderRow}
        </FixedSizeList>
      </Box>
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