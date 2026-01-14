import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';

export function MediaModal({ open, onClose, loading = false, mediaType, mediaData, rest }) {
  const handleClose = () => {
    onClose();
  };

  if (!mediaData?.length) return null;

  const isVideo = mediaType === 'video';

  const isImage = mediaType === 'image';

  const images = mediaData
    .filter((item) => item?.media_type === 'image')
    .map((item) => item.file_url);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
      {...rest}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Uploaded Images
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            pt: 1,
          }}
        >
          {isImage &&
            images?.map((image, index) => (
              <Box
                key={index}
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <Image
                  src={image}
                  alt={`preview-${index}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
