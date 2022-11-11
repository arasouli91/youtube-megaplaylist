import React from 'react';
import { Stack } from '@mui/material';
import SearchBar from './SearchBar';

const Navbar = ({ searchHandler }) => (
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
    <SearchBar searchHandler={searchHandler}></SearchBar>
  </Stack>
);

export default Navbar;
