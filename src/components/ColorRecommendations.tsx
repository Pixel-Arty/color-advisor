import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface ColorInfo {
  color: string;
  name: string;
  description: string;
}

interface ColorPalette {
  clothing: ColorInfo[];
  makeup: ColorInfo[];
  seasonType: string;
  undertone: string;
}

interface Props {
  palette: ColorPalette;
}

const ColorSwatch: React.FC<{ colorInfo: ColorInfo }> = ({ colorInfo }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <Box
      sx={{
        aspectRatio: '1',
        backgroundColor: colorInfo.color,
        borderRadius: 2,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}
    />
    <Typography variant="subtitle2" align="center">
      {colorInfo.name}
    </Typography>
    <Typography variant="caption" align="center" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
      {colorInfo.color}
    </Typography>
    <Typography variant="caption" align="center" color="text.secondary">
      {colorInfo.description}
    </Typography>
  </Box>
);

const ColorRecommendations: React.FC<Props> = ({ palette }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Your Color Story
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Color Profile
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Undertone: <strong>{palette.undertone}</strong>
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Season Type: <strong>{palette.seasonType}</strong>
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Fashion Palette
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 2 }}>
          {palette.clothing.map((colorInfo, index) => (
            <ColorSwatch key={index} colorInfo={colorInfo} />
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Beauty Palette
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 2 }}>
          {palette.makeup.map((colorInfo, index) => (
            <ColorSwatch key={index} colorInfo={colorInfo} />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default ColorRecommendations; 