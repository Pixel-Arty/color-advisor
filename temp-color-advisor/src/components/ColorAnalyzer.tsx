import React, { useState, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress, IconButton } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import ClearIcon from '@mui/icons-material/Clear';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ColorRecommendations from './ColorRecommendations';

interface ColorPalette {
  clothing: string[];
  makeup: string[];
}

const ColorAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);

  const handleRemoveImage = () => {
    setImage(null);
    setColorPalette(null);
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    try {
      // Load and process the image
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => (img.onload = resolve));

      // Create a canvas to sample colors
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      // For demo purposes, we're using a simple random selection
      // In a real app, this would be based on AI analysis
      const isWarmTone = Math.random() > 0.5;
      
      setColorPalette({
        clothing: isWarmTone 
          ? ['#FF6B6B', '#FFA07A', '#FFD700', '#FF8C00', '#FF4500']
          : ['#4ECDC4', '#87CEEB', '#6A5ACD', '#9370DB', '#BA55D3'],
        makeup: isWarmTone 
          ? ['#FFB6C1', '#FF69B4', '#FF1493', '#C71585', '#DB7093']
          : ['#E6E6FA', '#DDA0DD', '#DA70D6', '#BA55D3', '#9370DB'],
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImage(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false,
  });

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h1" align="center" sx={{ mb: 1 }}>
        MyHues
      </Typography>
      <Typography 
        variant="h6" 
        align="center" 
        sx={{ 
          mb: 6, 
          color: 'text.secondary',
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        Discover your perfect color palette with AI-powered personalization
      </Typography>
      
      {!image && (
        <Paper
          {...getRootProps()}
          sx={{
            p: 8,
            mb: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: (theme) => `0 12px 40px ${theme.palette.primary.main}25`,
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
          <Typography variant="h6" color="text.primary" gutterBottom>
            {isDragActive ? 'Drop your photo here...' : 'Upload your photo'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isDragActive
              ? 'Let the magic begin!'
              : 'Drag & drop or click to select'}
          </Typography>
        </Paper>
      )}

      {isAnalyzing && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 8 }}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Analyzing your colors...
          </Typography>
        </Box>
      )}

      {image && !isAnalyzing && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box 
            sx={{ 
              flex: 1, 
              position: 'relative',
              '&:hover .remove-button': {
                opacity: 1,
              },
            }}
          >
            <IconButton
              onClick={handleRemoveImage}
              className="remove-button"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.8)',
                },
              }}
            >
              <ClearIcon />
            </IconButton>
            <Box
              component="img"
              src={image}
              alt="Uploaded"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 3,
                boxShadow: (theme) => `0 8px 32px ${theme.palette.primary.main}15`,
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            {colorPalette && <ColorRecommendations palette={colorPalette} />}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ColorAnalyzer; 