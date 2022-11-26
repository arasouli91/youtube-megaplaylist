import * as React from 'react';
import { Stack } from '@mui/material';
import SearchBar from './SearchBar';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import ShuffleIcon from '@mui/icons-material/Shuffle'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import RuleIcon from '@mui/icons-material/Rule';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import SortIcon from '@mui/icons-material/Sort';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import Home from '@mui/icons-material/Home';

const Navbar = ({ searchHandler, setRandom, useMetrics, random, channels, toggleQueue }) => {
  const [localRandom, setLocalRandom] = React.useState(random);
  const [anchorEl1, setAnchorEl2] = React.useState(null);
  const [anchorEl2, setAnchorEl1] = React.useState(null);
  const open1 = Boolean(anchorEl1);
  const open2 = Boolean(anchorEl2);
  const imgs = []
  const handleClick = (event) => {
    setAnchorEl1(event.currentTarget);
  };
  const handleTopChannelsClick = (event) => {
    for (let i = 0; i < channels.length; i++) {
      imgs.push(new Image());
      imgs[i].src = channels[i].thumb;
    }
    setAnchorEl2(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl1(null);
    setAnchorEl2(null);
  };
  const handleRandom = (event) => {
    setRandom();
    setLocalRandom(!localRandom);
    handleClose();
  }
  const handleNightcore = (event) => {
    searchHandler("nightcore nightstyle");
    handleClose();
  }
  const handleClickChannel = (ndx) => {
    console.log("channel clicked", ndx);
    searchHandler(channels[parseInt(ndx)]._id);
    handleClose();
  }
  const handleHomeClick = (event) => {
    // clear search, clear random
    if (localRandom) {
      setLocalRandom(false);
      setRandom();
    }
    searchHandler("");
    handleClose();
  }

  return (
    <Stack
      direction='row'
      alignItems='center'
      p={2}
      sx={{
        position: { md: 'sticky' },
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        gap: '50px',
        background: '#000',
        borderBottom: '1px solid #3d3d3d',
      }}
      className="flex-center"
    >
      <div className='left-side-nav'>
        <Button>
          <Home onClick={handleHomeClick} className='nav-button'></Home>
        </Button>
      </div>
      <div className=".search-bar-container">
        <SearchBar searchHandler={searchHandler}></SearchBar>
      </div>
      <div className="nav-dropdown">
        {/*QUEUE BUTTON*/}
        <Button
          className={"nav-button"}
          onClick={toggleQueue}
        >
          <QueueMusicIcon></QueueMusicIcon>
        </Button>

        {/*TOP CHANNELS*/}
        <Button
          id="menu-button1"
          onClick={handleTopChannelsClick}
        >
          <SubscriptionsIcon></SubscriptionsIcon>
        </Button>
        <Menu
          id="menu1"
          className='menu'
          anchorEl={anchorEl1}
          open={open1}
          onClose={handleClose}
        >
          {/**GENERATE CHANNELS*/}
          {channels && (channels).map((channel, index) =>
            <MenuItem onClick={(event) => handleClickChannel(index)}>
              <div
                title={index} className="list-item-ndx">{`${index + 1}`}
              </div>
              <img title={index} src={`${channel.thumb}`} className="list-item-img" alt="t" />
              <span className="list-item-name">{channel._id}</span>
            </MenuItem>
          )}
        </Menu>

        {/*GENERAL MENU*/}
        <Button
          id="menu-button2"
          onClick={handleClick}
        >
          <MenuIcon></MenuIcon>
        </Button>
        <Menu
          id="menu2"
          className='menu'
          anchorEl={anchorEl2}
          open={open2}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}><SortIcon />Resort</MenuItem>
          <MenuItem onClick={handleRandom} className={localRandom ? "selected" : ""}><ShuffleIcon />Random</MenuItem>
          <MenuItem onClick={handleClose}><SubscriptionsIcon />By Channel</MenuItem>
          <MenuItem onClick={handleClose}><SortByAlphaIcon />Alphabetically</MenuItem>
          <MenuItem onClick={handleClose}><ThumbUpOffAltIcon />Like All</MenuItem>
          <MenuItem onClick={handleNightcore}><BedtimeIcon />Nightcore</MenuItem>
          <MenuItem onClick={handleClose}><CloudDownloadIcon />Backup DB</MenuItem>
          <MenuItem onClick={handleClose}><MoodBadIcon />Show Bad Songs</MenuItem>
          <MenuItem onClick={handleClose}><RuleIcon />Report Unavailable</MenuItem>
        </Menu>
      </div>


    </Stack >
  );
}

export default Navbar;
