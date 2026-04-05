import React from 'react';
import { Box, Container, Typography, Link, Grid2 } from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid2 container spacing={4}>
          <Grid2 item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              About Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discount Store By RGS provides quality products at the best prices.
              We're committed to making your shopping experience exceptional.
            </Typography>
          </Grid2>
          
          <Grid2 item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box>
              <Link href="/" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Home
              </Link>
              <Link href="/about" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                About Us
              </Link>
              <Link href="/contact" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Contact Us
              </Link>
            </Box>
          </Grid2>
          
          <Grid2 item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Info
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: info@discountstore.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: +91 - 9028262272, +91 - 9699474642
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Address: Near sawarkar statue,Main road,kallam,Dharashiv,Maharashtra 413507
            </Typography>
          </Grid2>
        </Grid2>
        
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="/">
              Discount Store By RGS
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer; 