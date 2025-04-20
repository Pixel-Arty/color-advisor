import React, { useState, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress, IconButton, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';
import ColorRecommendations from './ColorRecommendations.tsx';

interface ColorPalette {
  clothing: Array<{
    color: string;
    name: string;
    description: string;
  }>;
  makeup: Array<{
    color: string;
    name: string;
    description: string;
  }>;
  seasonType: string;
  undertone: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

const ColorAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveImage = () => {
    setImage(null);
    setColorPalette(null);
    setError(null);
  };

  const rgbToHsl = (r: number, g: number, b: number): HSL => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const getColorName = (h: number, s: number, l: number): string => {
    // Basic color naming logic
    if (l < 20) return 'Black';
    if (l > 80) return 'White';
    if (s < 20) return l > 50 ? 'Light Gray' : 'Dark Gray';

    const hue = h;
    if (hue >= 0 && hue < 30) return 'Red';
    if (hue >= 30 && hue < 60) return 'Orange';
    if (hue >= 60 && hue < 90) return 'Yellow';
    if (hue >= 90 && hue < 150) return 'Green';
    if (hue >= 150 && hue < 210) return 'Cyan';
    if (hue >= 210 && hue < 270) return 'Blue';
    if (hue >= 270 && hue < 330) return 'Purple';
    return 'Red';
  };

  const determineUndertone = (dominantHues: number[]): string => {
    const avgHue = dominantHues.reduce((a, b) => a + b, 0) / dominantHues.length;
    return avgHue < 180 ? 'Warm' : 'Cool';
  };

  const determineSeasonType = (undertone: string, brightness: number, saturation: number): string => {
    if (undertone === 'Warm') {
      return brightness > 50
        ? saturation > 50 ? 'Spring' : 'Spring-Summer'
        : saturation > 50 ? 'Autumn' : 'Autumn-Winter';
    } else {
      return brightness > 50
        ? saturation > 50 ? 'Summer' : 'Spring-Summer'
        : saturation > 50 ? 'Winter' : 'Autumn-Winter';
    }
  };

  const generateHarmonizedPalette = (baseHue: number, undertone: string): string[] => {
    const palette: string[] = [];
    const hueStep = undertone === 'Warm' ? 30 : 45;
    
    for (let i = 0; i < 5; i++) {
      const hue = (baseHue + i * hueStep) % 360;
      const saturation = 65 + Math.random() * 20;
      const lightness = 45 + Math.random() * 25;
      
      const [r, g, b] = hslToRgb(hue / 360, saturation / 100, lightness / 100);
      palette.push(rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)));
    }
    
    return palette;
  };

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [r, g, b];
  };

  const analyzeImage = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setError(null);
    let canvas: HTMLCanvasElement | null = null;

    try {
      const img = new Image();
      img.src = imageDataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels: RGB[] = [];

      // Sample every 4th pixel for better performance
      for (let i = 0; i < imageData.data.length; i += 16) {
        pixels.push({
          r: imageData.data[i],
          g: imageData.data[i + 1],
          b: imageData.data[i + 2],
        });
      }

      // Calculate average brightness and saturation
      let totalBrightness = 0;
      let totalSaturation = 0;
      const dominantHues: number[] = [];

      pixels.forEach(pixel => {
        const hsl = rgbToHsl(pixel.r, pixel.g, pixel.b);
        totalBrightness += hsl.l;
        totalSaturation += hsl.s;
        dominantHues.push(hsl.h);
      });

      const avgBrightness = totalBrightness / pixels.length;
      const avgSaturation = totalSaturation / pixels.length;
      const undertone = determineUndertone(dominantHues);
      const seasonType = determineSeasonType(undertone, avgBrightness, avgSaturation);

      // Generate color palettes
      const baseHue = dominantHues.reduce((a, b) => a + b, 0) / dominantHues.length;
      const clothingColors = generateHarmonizedPalette(baseHue, undertone);
      const makeupColors = generateHarmonizedPalette((baseHue + 180) % 360, undertone);

      const palette: ColorPalette = {
        undertone,
        seasonType,
        clothing: clothingColors.map((color, index) => {
          const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          return {
            color,
            name: getColorName(hsl.h, hsl.s, hsl.l),
            description: getColorDescription(index, undertone),
          };
        }),
        makeup: makeupColors.map((color, index) => {
          const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          return {
            color,
            name: getColorName(hsl.h, hsl.s, hsl.l),
            description: getMakeupDescription(index, undertone),
          };
        }),
      };

      setColorPalette(palette);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
      if (canvas) {
        // Clean up canvas
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  };

  const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getColorDescription = (index: number, undertone: string): string => {
    const descriptions = [
      'Perfect for statement pieces and focal points',
      'Great for accessories and accent pieces',
      'Ideal for layering and combining outfits',
      'Excellent for seasonal transitions',
      'Works well for everyday basics'
    ];
    return descriptions[index];
  };

  const getMakeupDescription = (index: number, undertone: string): string => {
    const descriptions = [
      'Perfect for bold lip colors',
      'Ideal for eye shadows and liners',
      'Great for blush and cheek colors',
      'Suitable for highlighters and bronzers',
      'Works well for natural everyday looks'
    ];
    return descriptions[index];
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
  }, [analyzeImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false,
  });

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      py: 4,
    }}>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h2" align="center" sx={{ mb: 1 }}>
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

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
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
              {isDragActive ? 'Drop your photo here...' : 'Upload a photo of yourself'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isDragActive
                ? 'Let the magic begin!'
                : 'We\'ll analyze your skin tone and create personalized color recommendations'}
            </Typography>
          </Paper>
        )}

        {isAnalyzing && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 8 }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h6" color="text.secondary">
              Analyzing your colors and creating personalized recommendations...
            </Typography>
          </Box>
        )}

        {image && !isAnalyzing && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 4, 
            alignItems: 'flex-start',
            mt: 4
          }}>
            <Box 
              sx={{ 
                flex: 1, 
                maxWidth: { md: '50%' },
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
                  maxHeight: '50vh',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Box sx={{ flex: 1, maxWidth: { md: '50%' } }}>
              {colorPalette && <ColorRecommendations palette={colorPalette} />}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ColorAnalyzer; 