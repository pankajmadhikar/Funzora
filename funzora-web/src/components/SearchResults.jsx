import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Box,
  CircularProgress
} from '@mui/material';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = searchParams.get('q');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await api.searchProducts(query);
        setResults(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch search results');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Search Results for "{query}"
      </Typography>
      
      {results.length === 0 ? (
        <Typography>No products found matching your search.</Typography>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {results.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              {/* Your product card component here */}
              <Box>
                <Typography variant="h6">{product.name}</Typography>
                <Typography>{product.description}</Typography>
                <Typography>Price: ${product.price}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SearchResults; 