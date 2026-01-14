import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

export function UploadAvatar({
  sx,
  error,
  value,
  disabled,
  helperText,
  className,
  ...other
}) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    multiple: false,
    disabled,
    accept: { 'image/*': [] },
    ...other,
  });

  const hasFile = !!value;
  const hasError = isDragReject || !!error;
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (typeof value === 'string') {
      setPreview(value);
    } else if (value instanceof File) {
      setPreview(URL.createObjectURL(value));
    }
  }, [value]);

  const renderPreview = () =>
    hasFile && (
      <img 
        alt="Avatar" 
        src={preview} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          borderRadius: '50%' 
        }} 
      />
    );

  const renderPlaceholder = () => (
    <Box
      className="upload-placeholder"
      sx={(theme) => ({
        top: 0,
        gap: 1,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 9,
        display: 'flex',
        borderRadius: '50%',
        position: 'absolute',
        alignItems: 'center',
        color: 'text.disabled',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: theme.palette.grey[100],
        transition: theme.transitions.create(['opacity'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': { opacity: 0.72 },
        ...(hasError && {
          color: 'error.main',
          bgcolor: theme.palette.error.lighter,
        }),
        ...(hasFile && {
          zIndex: 9,
          opacity: 0,
          color: 'common.white',
          bgcolor: 'rgba(0, 0, 0, 0.64)',
        }),
      })}
    >
      <Iconify icon="solar:camera-add-bold" width={32} />
      <Typography variant="caption">{hasFile ? 'Update photo' : 'Upload photo'}</Typography>
    </Box>
  );

  const renderContent = () => (
    <Box
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
        borderRadius: '50%',
        position: 'relative',
      }}
    >
      {renderPreview()}
      {renderPlaceholder()}
    </Box>
  );

  return (
    <>
      <Box
        {...getRootProps()}
        className={className}
        sx={[
          (theme) => ({
            p: 1,
            m: 'auto',
            width: 144,
            height: 144,
            cursor: 'pointer',
            overflow: 'hidden',
            borderRadius: '50%',
            border: `1px dashed ${theme.palette.grey[300]}`,
            ...(isDragActive && { opacity: 0.72 }),
            ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
            ...(hasError && { borderColor: 'error.main' }),
            ...(hasFile && {
              ...(hasError && { bgcolor: theme.palette.error.lighter }),
              '&:hover .upload-placeholder': { opacity: 1 },
            }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <input {...getInputProps()} />
        {renderContent()}
      </Box>

      {helperText && helperText}
    </>
  );
}
