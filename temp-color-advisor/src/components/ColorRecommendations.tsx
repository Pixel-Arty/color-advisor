import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface ColorPalette {
  clothing: string[];
  makeup: string[];
}

interface Props {
  palette: ColorPalette;
}

const ColorSwatch: React.FC<{ color: string; name?: string }> = ({ color, name }) => {
  // Calculate whether to use white or black text based on background color
  const getRGB = (hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const [r, g, b] = getRGB(color);
  const luminance = getLuminance(r, g, b);
  const textColor = luminance > 0.5 ? '#000000' : '#FFFFFF';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        width: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <Box
        sx={{
          aspectRatio: '1',
          backgroundColor: color,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.1)',
        }}
      />
      {name && (
        <Typography 
          variant="body2" 
          align="center"
          sx={{ 
            fontWeight: 600,
            color: textColor,
            backgroundColor: color,
            padding: '8px 12px',
            borderRadius: 2,
            letterSpacing: '0.5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            },
          }}
        >
          {name.toUpperCase()}
        </Typography>
      )}
    </Box>
  );
};

const ColorRecommendations: React.FC<Props> = ({ palette }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, color: 'text.primary' }}>
        Your Color Story
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
          Fashion Palette
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {palette.clothing.map((color) => (
            <Box key={color} sx={{ width: 'calc(20% - 12px)', minWidth: '80px' }}>
              <ColorSwatch color={color} name={color} />
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
          Beauty Palette
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {palette.makeup.map((color) => (
            <Box key={color} sx={{ width: 'calc(20% - 12px)', minWidth: '80px' }}>
              <ColorSwatch color={color} name={color} />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default ColorRecommendations; 