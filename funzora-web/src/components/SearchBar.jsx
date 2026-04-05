import React, { useState } from 'react';
import { 
  Box,
  InputBase,
  IconButton,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        backgroundColor: '#f5f5f5',
        '&:hover': {
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }
      }}
    >
      <IconButton 
        type="submit" 
        sx={{ 
          p: '10px',
          color: '#757575',
          '&:hover': {
            color: '#1976d2'
          }
        }} 
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
      <InputBase
        sx={{ 
          ml: 1, 
          flex: 1,
          '& input': {
            padding: '8px 0'
          }
        }}
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        inputProps={{ 
          'aria-label': 'search products',
          style: { fontSize: '0.95rem' }
        }}
      />
    </Paper>
  );
};

export default SearchBar; 
