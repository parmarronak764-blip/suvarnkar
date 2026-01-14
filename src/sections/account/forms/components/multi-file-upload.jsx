import { useState, useCallback } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function MultiFileUpload({ name, label, accept = '*', maxFiles = 5, helperText, ...other }) {
  const { control } = useFormContext();
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = useCallback(
    (event, onChange) => {
      const files = Array.from(event.target.files || []);

      if (files.length > maxFiles) {
        alert(`You can only select up to ${maxFiles} files`);
        return;
      }

      setSelectedFiles(files);
      onChange(files);
    },
    [maxFiles]
  );

  const handleRemoveFile = useCallback(
    (index, onChange) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      onChange(newFiles);
    },
    [selectedFiles]
  );

  const handleClearAll = useCallback((onChange) => {
    setSelectedFiles([]);
    onChange([]);
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {label}
          </Typography>

          <Box
            sx={{
              border: '2px dashed',
              borderColor: error ? 'error.main' : 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: 'grey.50',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.lighter',
              },
            }}
          >
            <input
              type="file"
              accept={accept}
              multiple
              onChange={(event) => handleFileSelect(event, onChange)}
              style={{ display: 'none' }}
              id={`file-input-${name}`}
            />

            <label htmlFor={`file-input-${name}`} style={{ cursor: 'pointer', display: 'block' }}>
              <Button
                variant="contained"
                component="span"
                startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                sx={{
                  mb: 1,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                Choose Files
              </Button>
            </label>

            <Typography variant="body2" color="text.secondary">
              {helperText || `Select up to ${maxFiles} files`}
            </Typography>

            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2">
                    Selected Files ({selectedFiles.length}/{maxFiles})
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleClearAll(onChange)}
                    startIcon={<Iconify icon="eva:trash-2-fill" />}
                  >
                    Clear All
                  </Button>
                </Stack>

                <Stack spacing={1}>
                  {selectedFiles.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        border: 1,
                        borderColor: 'grey.300',
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify
                          icon={
                            file.type.startsWith('image/') ? 'eva:image-fill' : 'eva:file-text-fill'
                          }
                          sx={{ color: 'text.secondary' }}
                        />
                        <Box>
                          <Typography variant="body2" noWrap>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                      </Stack>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveFile(index, onChange)}
                      >
                        <Iconify icon="eva:close-fill" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          {error && (
            <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
              {error.message}
            </Typography>
          )}
        </Box>
      )}
      {...other}
    />
  );
}
