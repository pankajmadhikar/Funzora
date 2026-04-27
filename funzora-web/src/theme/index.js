import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B35',
      light: '#FFF0EB',
      dark: '#e55c28',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7B4FFF',
      light: '#F3EFFF',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444',
      light: '#FEF2F2',
      dark: '#991b1b',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF9EC',
      dark: '#b45309',
    },
    success: {
      main: '#2ECC71',
      light: '#EAFAF1',
      dark: '#15803d',
    },
    info: {
      main: '#0891b2',
      light: '#06b6d4',
      dark: '#0e7490',
    },
    grey: {
      50: '#F7F8FA',
      100: '#f3f4f6',
      200: '#EBEBEB',
      300: '#D5D5D5',
      400: '#9899A6',
      500: '#555770',
      600: '#4b5563',
      700: '#374151',
      800: '#1A1A2E',
      900: '#111827',
    },
    background: {
      default: '#F7F8FA',
      paper: '#ffffff',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#555770',
      disabled: '#C4C4CF',
    },
    divider: '#EBEBEB',
  },
  typography: {
    fontFamily: "'Nunito', sans-serif",
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.2 },
    h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.2 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.2 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 },
    subtitle1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 },
    subtitle2: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 800,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 700 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1A1A2E',
          boxShadow: 'none',
          borderBottom: '1px solid #EBEBEB',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRadius: 0 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});
