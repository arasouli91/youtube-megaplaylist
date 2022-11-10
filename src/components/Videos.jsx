import * as React from "react";
import { useEffect } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { Link } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Box,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import ChannelCard from './ChannelCard';
import Loader from './Loader';

///// I can just scrap the this and build it myself

///// You are editing this, but the feed is also using

//// side bar needs:
/*
    max-height: 1000px;
    overflow-y: scroll;
    flex-direction: row;

    revert whatever else you did here
    add more params to make this work for side bar and feeds
*/

const Videos = ({ videos, curNdx, direction, videoSelected }) => {
  const listRef = React.createRef();

  useEffect(() => {
    if (curNdx)
      listRef.current.scrollToItem(curNdx);
  }, [curNdx]);

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
    /** 
            <Box key={idx}>
              {item.id && (
                <Card onClick={(e) => videoSelected(e)}
                  sx={{
                    width: { md: '820px', xs: '350px' },
                    height: 160,
                    boxShadow: 'none',
                  }}
                  direction={'column'}
                >
                  <Link
                    to={
                      item?.id
                        ? `/video/${item.id}`
                        : `/video/cV2gBU6hKfY`
                    }
                  >
                    <CardMedia
                      component='img'
                      height='156'
                      width='50'
                      image={
                        item.snippet?.thumbnails?.high.url ||
                        'https://i.ytimg.com/vi/7PCkvCPvDXk/hqdefault.jpg'
                      }
                      alt='green iguana'
                    />
                  </Link>
                  <CardContent>
                    <Link
                      to={
                        item?.id?.videoId
                          ? `/video/${item.id.videoId}`
                          : `/video/7PCkvCPvDXk`
                      }
                    >
                      <Typography fontSize='15px' fontWeight={600}>
                        {item.snippet?.title.slice(0, 60) ||
                          'Meghan Trainor - All About That Bass'}
                      </Typography>
                    </Link>
                    <Link
                      to={
                        item?.snippet?.channelId
                          ? `/channel/${item.snippet?.channelId}`
                          : '/channel/UCf3cbfAXgPFL6OywH7JwOzA'
                      }
                    >
                      <Typography fontSize='14px' fontWeight={500}>
                        {item.snippet?.channelTitle || 'MeghanTrainorVEVO'}
                        <CheckCircleIcon
                          sx={{ fontSize: '12px', color: 'gray', ml: '5px' }}
                        />
                      </Typography>
                    </Link>
                  </CardContent>
                </Card>
              )}
              {item.id.channelId && (
                <Link to={`/channel/${item.id.channelId}`}>
                  <ChannelCard channelDetail={item} />
                </Link>
              )}
            </Box>
            */
    //

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
          selected={index == curNdx ? true : false}
          onClick={handleSelect}
          title={index}
        >
          <div
            title={index} className="list-item-ndx">{`${index + 1}`}</div>

          <img
            title={index} src={`${thumbnail}`} className="list-item-img" />

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