import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import GoldPurchaseSection from './GoldPurchaseSection';
import PlatinumPurchaseSection from './PlatinumPurchaseSection';
import DiamondPurchaseSection from './DiamondPurchaseSection';

export default function GoldPlatinumDiamondPurchaseSection() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Combined Purchase (Gold + Platinum + Diamond)
      </Typography>
      <GoldPurchaseSection />
      <Divider sx={{ my: 4 }} />
      <PlatinumPurchaseSection />
      <Divider sx={{ my: 4 }} />
      <DiamondPurchaseSection />
    </Box>
  );
}
