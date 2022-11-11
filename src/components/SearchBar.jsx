import React, { useState } from 'react';
import { Paper, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ searchHandler }) => {
  const [searchTerm, setSearchTerm] = useState('');


  const onhandleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      searchHandler(searchTerm);
    }
  };

  return (
    <Paper
      component='form'
      onSubmit={onhandleSubmit}
      sx={{
        borderRadius: 20,
        border: '1px solid #e3e3e3',
        pl: 2,
        boxShadow: 'none',
        mr: { sm: 5 },
      }}
      className="search-bar"
    >
      <input
        className='search-bar-input'
        placeholder='Search...'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <IconButton
        type='submit'
        sx={{ p: '10px', color: 'red' }}
        aria-label='search'
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;
