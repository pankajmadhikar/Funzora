import React from 'react';
import { Container, Typography, Paper, Grid, Box, Card, CardContent, Avatar } from '@mui/material';
import { Store, LocalShipping, Security, Support } from '@mui/icons-material';

function AboutUs() {
  const features = [
    {
      icon: <Store fontSize="large" color="primary" />,
      title: 'Wide Selection',
      description: 'Browse through thousands of products from top brands at competitive prices.'
    },
    {
      icon: <LocalShipping fontSize="large" color="primary" />,
      title: 'Fast Delivery',
      description: 'Get your orders delivered quickly and efficiently to your doorstep.'
    },
    {
      icon: <Security fontSize="large" color="primary" />,
      title: 'Secure Shopping',
      description: 'Shop with confidence knowing your data is protected with top-notch security.'
    },
    {
      icon: <Support fontSize="large" color="primary" />,
      title: '24/7 Support',
      description: 'Our customer service team is always ready to help you with any queries.'
    }
  ];



  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          About Discount Store By RGS
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          Your One-Stop Shop for Quality Products at Amazing Prices
        </Typography>
      </Box>

      {/* Mission Statement */}
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Our Mission
        </Typography>
        <Typography variant="body1" paragraph>
          At Discount Store By RGS, we're committed to providing our customers with the best shopping
          experience possible. We believe that quality products shouldn't come with a premium price tag,
          and we work tirelessly to bring you the best deals without compromising on quality.
        </Typography>
      </Paper>

      {/* Features Grid */}
      <Box sx={{ my: 8 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Box sx={{ my: 2 }}>
                  {feature.icon}
                </Box>
                <CardContent>
                  <Typography variant="h6" component="h3" align="center" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

    </Container>
  );
}

export default AboutUs; 