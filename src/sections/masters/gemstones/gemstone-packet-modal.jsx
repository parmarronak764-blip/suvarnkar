import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Form, Field } from 'src/components/hook-form';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';
import { useGemstone } from 'src/hooks/useGemstone';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const GemstonePacketSchema = zod.object({
  packet_name: zod
    .string()
    .min(1, 'Packet name is required!')
    .max(200, 'Packet name must be 200 characters or less'),
  packet_code: zod.string().optional(),
  gemstone_main_type: zod.number().int().min(1, 'Gemstone main type is required!'),
  gemstone_sub_type: zod.number().int().min(1, 'Gemstone sub type is required!'),
  gemstone_shape: zod.number().int().min(1, 'Gemstone shape is required!'),
  pieces: zod
    .number()
    .int()
    .min(0, 'Pieces must be 0 or greater')
    .max(2147483647, 'Pieces value is too large'),
  packet_weight: zod.string().min(1, 'Packet weight is required!'),
  packet_rate: zod.string().min(1, 'Packet rate is required!'),
});

// ----------------------------------------------------------------------

const BulkGemstonePacketSchema = zod.object({
  packets: zod
    .array(
      zod.object({
        packet_name: zod
          .string()
          .min(1, 'Packet name is required!')
          .max(200, 'Packet name must be 200 characters or less'),
        packet_code: zod.string().optional(),
        gemstone_main_type: zod.coerce.number().int().min(1, 'Gemstone main type is required!'),
        gemstone_sub_type: zod.coerce.number().int().min(1, 'Gemstone sub type is required!'),
        gemstone_shape: zod.coerce.number().int().min(1, 'Gemstone shape is required!'),
        pieces: zod.coerce
          .number()
          .int()
          .min(0, 'Pieces must be 0 or greater')
          .max(2147483647, 'Pieces value is too large'),
        packet_weight: zod.string().min(1, 'Packet weight is required!'),
        packet_rate: zod.string().min(1, 'Packet rate is required!'),
      })
    )
    .min(1, { message: 'Please add at least one packet!' }),
});

export function GemstonePacketModal({ open, onClose, currentItem, onSave, loading, onSaved }) {
  const { fetchSubTypes, fetchShapes, fetchGemstoneMainTypes, createBulkPackets } = useGemstone();
  const [subTypes, setSubTypes] = useState([]);
  const [subTypesByMainType, setSubTypesByMainType] = useState({}); // Store sub types by main type ID
  const [shapes, setShapes] = useState([]);
  const [mainTypes, setMainTypes] = useState([]);
  const [isBulkEntry, setIsBulkEntry] = useState(false);
  const defaultValues = useMemo(
    () => ({
      packet_name: '',
      packet_code: '',
      gemstone_main_type: 0,
      gemstone_sub_type: 0,
      gemstone_shape: 0,
      pieces: 0,
      packet_weight: '',
      packet_rate: '',
    }),
    []
  );

  const methods = useForm({
    resolver: zodResolver(GemstonePacketSchema),
    defaultValues: currentItem
      ? {
          packet_name: currentItem.packet_name || '',
          packet_code: currentItem.packet_code || '',
          gemstone_main_type: currentItem.gemstone_main_type || 0,
          gemstone_sub_type: currentItem.gemstone_sub_type || 0,
          gemstone_shape: currentItem.gemstone_shape || 0,
          pieces: currentItem.pieces || 0,
          packet_weight: currentItem.packet_weight || '',
          packet_rate: currentItem.packet_rate || '',
        }
      : defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  // Watch for main type changes
  const selectedMainType = watch('gemstone_main_type');

  const bulkMethods = useForm({
    resolver: zodResolver(BulkGemstonePacketSchema),
    defaultValues: {
      packets: [
        {
          packet_name: '',
          packet_code: '',
          gemstone_main_type: 0,
          gemstone_sub_type: 0,
          gemstone_shape: 0,
          pieces: 0,
          packet_weight: '',
          packet_rate: '',
        },
      ],
    },
  });

  const {
    reset: resetBulk,
    handleSubmit: handleBulkSubmit,
    watch: watchBulk,
    formState: { isSubmitting: isBulkSubmitting },
  } = bulkMethods;

  // Watch for main type changes in bulk form
  const bulkPackets = watchBulk('packets');

  // Fetch sub types when main type changes in bulk form
  useEffect(() => {
    if (!open || !bulkPackets || !isBulkEntry) return;

    const fetchSubTypesForMainTypes = async () => {
      const mainTypeIds = new Set();
      bulkPackets.forEach((packet) => {
        if (packet.gemstone_main_type && packet.gemstone_main_type > 0) {
          mainTypeIds.add(packet.gemstone_main_type);
        }
      });

      // Fetch sub types for each unique main type that we don't have yet
      const fetchPromises = Array.from(mainTypeIds)
        .filter((mainTypeId) => !subTypesByMainType[mainTypeId])
        .map(async (mainTypeId) => {
          const subTypeRes = await fetchSubTypes(undefined, undefined, {
            pagination: false,
            carat: mainTypeId,
          });

          if (subTypeRes?.success) {
            setSubTypesByMainType((prev) => ({
              ...prev,
              [mainTypeId]: subTypeRes.data || [],
            }));
          }
        });

      await Promise.all(fetchPromises);
    };

    fetchSubTypesForMainTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkPackets, open, isBulkEntry, fetchSubTypes]);

  // Load initial dropdown data (non-paginated) when modal opens
  useEffect(() => {
    const loadDropdowns = async () => {
      const [shapeRes, mainTypeRes] = await Promise.all([
        fetchShapes(undefined, undefined, { pagination: false }),
        fetchGemstoneMainTypes(),
      ]);

      if (shapeRes?.success) {
        setShapes(shapeRes.data || []);
      } else if (open) {
        toast.error(shapeRes?.message || 'Failed to load gemstone shapes');
      }

      if (mainTypeRes?.success) {
        setMainTypes(mainTypeRes.data || []);
      } else if (open) {
        toast.error(mainTypeRes?.message || 'Failed to load gemstone main types');
      }

      // Load sub types if editing and main type is already selected
      if (currentItem?.gemstone_main_type) {
        const subTypeRes = await fetchSubTypes(undefined, undefined, {
          pagination: false,
          carat: currentItem.gemstone_main_type,
        });
        if (subTypeRes?.success) {
          setSubTypes(subTypeRes.data || []);
        }
      } else {
        // Reset sub types if no main type selected
        setSubTypes([]);
      }
    };

    if (open) {
      loadDropdowns();
    }
  }, [open, fetchShapes, fetchGemstoneMainTypes, fetchSubTypes, currentItem, reset]);

  // Fetch sub types when main type changes (single entry form)
  useEffect(() => {
    const loadSubTypes = async () => {
      if (selectedMainType && selectedMainType > 0) {
        const subTypeRes = await fetchSubTypes(undefined, undefined, {
          pagination: false,
          carat: selectedMainType,
        });
        if (subTypeRes?.success) {
          setSubTypes(subTypeRes.data || []);
          // Only reset sub type selection when main type changes (not on initial load for edit)
          if (!currentItem || selectedMainType !== currentItem.gemstone_main_type) {
            setValue('gemstone_sub_type', 0);
          }
        } else if (open) {
          toast.error(subTypeRes?.message || 'Failed to load gemstone sub types');
          setSubTypes([]);
        }
      } else {
        // Clear sub types if no main type selected
        setSubTypes([]);
        if (!currentItem) {
          setValue('gemstone_sub_type', 0);
        }
      }
    };

    if (open) {
      loadSubTypes();
    }
  }, [selectedMainType, open, fetchSubTypes, setValue, currentItem]);

  // Reset form when currentItem changes (for edit mode)
  useEffect(() => {
    if (!open) return;

    if (currentItem) {
      // Reset form with currentItem data when editing
      reset({
        packet_name: currentItem.packet_name || '',
        packet_code: currentItem.packet_code || '',
        gemstone_main_type: currentItem.gemstone_main_type || 0,
        gemstone_sub_type: currentItem.gemstone_sub_type || 0,
        gemstone_shape: currentItem.gemstone_shape || 0,
        pieces: currentItem.pieces || 0,
        packet_weight: currentItem.packet_weight || '',
        packet_rate: currentItem.packet_rate || '',
      });
    } else {
      // Reset to default values when creating new
      setIsBulkEntry(false);
      setSubTypesByMainType({}); // Reset sub types cache
      reset(defaultValues);
      resetBulk({
        packets: [
          {
            packet_name: '',
            packet_code: '',
            gemstone_main_type: 0,
            gemstone_sub_type: 0,
            gemstone_shape: 0,
            pieces: 0,
            packet_weight: '',
            packet_rate: '',
          },
        ],
      });
    }
  }, [open, currentItem, reset, resetBulk, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Format data according to API requirements
      const formattedData = {
        packet_name: (data.packet_name || '').trim(),
        ...(data.packet_code && data.packet_code.trim()
          ? { packet_code: data.packet_code.trim() }
          : {}),
        gemstone_main_type: Number(data.gemstone_main_type),
        gemstone_sub_type: Number(data.gemstone_sub_type),
        gemstone_shape: Number(data.gemstone_shape),
        pieces: Number(data.pieces),
        packet_weight: String(data.packet_weight || '').trim(),
        packet_rate: String(data.packet_rate || '').trim(),
      };

      const result = await onSave(formattedData);
      if (result && result.success) {
        reset();
        if (onSaved) onSaved();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error(error);
    }
  });

  const onBulkSubmit = handleBulkSubmit(
    async (data) => {
      try {
        const items = (data.packets || [])
          .map((p) => {
            const item = {
              packet_name: (p.packet_name || '').trim(),
              gemstone_main_type: Number(p.gemstone_main_type) || 0,
              gemstone_sub_type: Number(p.gemstone_sub_type) || 0,
              gemstone_shape: Number(p.gemstone_shape) || 0,
              pieces: Number(p.pieces) || 0,
              packet_weight: String(p.packet_weight || '').trim(),
              packet_rate: String(p.packet_rate || '').trim(),
            };
            // Only include packet_code if it's not empty
            if (p.packet_code && p.packet_code.trim()) {
              item.packet_code = p.packet_code.trim();
            }
            return item;
          })
          .filter(
            (p) =>
              p.packet_name &&
              p.gemstone_main_type > 0 &&
              p.gemstone_sub_type > 0 &&
              p.gemstone_shape > 0 &&
              p.packet_weight &&
              p.packet_rate
          );


        if (items.length === 0) {
          toast.error('Please add at least one valid packet with all required fields.');
          return;
        }

        const result = await createBulkPackets(items);

        if (result && result.success) {
          const successMessage =
            items.length === 1
              ? 'Gemstone packet created successfully!'
              : `Successfully created ${items.length} gemstone packets!`;
          toast.success(successMessage);

          resetBulk({
            packets: [
              {
                packet_name: '',
                packet_code: '',
                gemstone_main_type: 0,
                gemstone_sub_type: 0,
                gemstone_shape: 0,
                pieces: 0,
                packet_weight: '',
                packet_rate: '',
              },
            ],
          });
          if (onSaved) onSaved();
          if (onClose) onClose();
        } else {
          toast.error(result?.message || 'Failed to create gemstone packets');
        }
      } catch (error) {
        console.error('Bulk form submission error:', error);
        toast.error(error?.message || 'Failed to create gemstone packets');
      }
    },
    (errors) => {
      console.log('Bulk form validation errors:', errors);
      const errorMessages = Object.keys(errors).map((key) => {
        const error = errors[key];
        if (error?.message) return error.message;
        if (error?.packets) {
          return `Packets: ${Object.keys(error.packets).length} error(s)`;
        }
        return `${key}: validation error`;
      });
      toast.error(`Please fix the following errors:\n${errorMessages.join('\n')}`);
    }
  );

  const handleClose = () => {
    // Reset all form state when closing
    reset(defaultValues);
    resetBulk({
      packets: [
        {
          packet_name: '',
          packet_code: '',
          gemstone_main_type: 0,
          gemstone_sub_type: 0,
          gemstone_shape: 0,
          pieces: 0,
          packet_weight: '',
          packet_rate: '',
        },
      ],
    });
    setSubTypes([]);
    setSubTypesByMainType({});
    setIsBulkEntry(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { overflow: 'hidden', maxHeight: '85vh' },
      }}
    >
      {currentItem ? (
        <Form methods={methods} onSubmit={onSubmit}>
          <DialogTitle>Edit Gemstone Packet</DialogTitle>

          <DialogContent dividers sx={{ overflow: 'visible' }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Field.Text
                name="packet_name"
                label="Packet Name *"
                InputLabelProps={{ shrink: true }}
              />
              <Field.Text
                name="packet_code"
                label="Packet Code (Optional)"
                InputLabelProps={{ shrink: true }}
              />
              <Field.Select
                name="gemstone_main_type"
                label="Gemstone Main Type *"
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value={0}>Select Main Type</MenuItem>
                {mainTypes.map((mt) => (
                  <MenuItem key={mt.id} value={mt.id}>
                    {mt.name || mt.main_type_name || `ID: ${mt.id}`}
                  </MenuItem>
                ))}
              </Field.Select>
              <Field.Select
                name="gemstone_sub_type"
                label="Gemstone Sub Type *"
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value={0}>Select Sub Type</MenuItem>
                {subTypes.map((st) => (
                  <MenuItem key={st.id} value={st.id}>
                    {st.sub_type_name || st.name}
                  </MenuItem>
                ))}
              </Field.Select>
              <Field.Select
                name="gemstone_shape"
                label="Gemstone Shape *"
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value={0}>Select Shape</MenuItem>
                {shapes.map((sh) => (
                  <MenuItem key={sh.id} value={sh.id}>
                    {sh.name}
                  </MenuItem>
                ))}
              </Field.Select>
              <Field.Text
                name="pieces"
                label="Pieces *"
                type="number"
                placeholder="Number of pieces in the packet"
                InputLabelProps={{ shrink: true }}
              />
              <Field.Text
                name="packet_weight"
                label="Packet Weight *"
                InputLabelProps={{ shrink: true }}
              />
              <Field.Text
                name="packet_rate"
                label="Packet Rate *"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>
              Update
            </LoadingButton>
          </DialogActions>
        </Form>
      ) : (
        <>
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              Add Gemstone Packet
              <FormControlLabel
                control={
                  <Switch
                    checked={isBulkEntry}
                    onChange={(e) => setIsBulkEntry(e.target.checked)}
                  />
                }
                label="Bulk Entry"
                labelPlacement="start"
                sx={{ mr: 0 }}
              />
            </Stack>
          </DialogTitle>

          {!isBulkEntry ? (
            <Form methods={methods} onSubmit={onSubmit}>
              <DialogContent dividers sx={{ overflow: 'auto', maxHeight: '70vh', pb: 9, pt: 1 }}>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  }}
                >
                  <Field.Text
                    name="packet_name"
                    label="Packet Name *"
                    InputLabelProps={{ shrink: true }}
                  />
                  <Field.Text
                    name="packet_code"
                    label="Packet Code (Optional)"
                    InputLabelProps={{ shrink: true }}
                  />
                  <Field.Select
                    name="gemstone_main_type"
                    label="Gemstone Main Type *"
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value={0}>Select Main Type</MenuItem>
                    {mainTypes.map((mt) => (
                      <MenuItem key={mt.id} value={mt.id}>
                        {mt.name || mt.main_type_name || `ID: ${mt.id}`}
                      </MenuItem>
                    ))}
                  </Field.Select>
                  <Field.Select
                    name="gemstone_sub_type"
                    label="Gemstone Sub Type *"
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value={0}>Select Sub Type</MenuItem>
                    {subTypes.map((st) => (
                      <MenuItem key={st.id} value={st.id}>
                        {st.sub_type_name || st.name}
                      </MenuItem>
                    ))}
                  </Field.Select>
                  <Field.Select
                    name="gemstone_shape"
                    label="Gemstone Shape *"
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value={0}>Select Shape</MenuItem>
                    {shapes.map((sh) => (
                      <MenuItem key={sh.id} value={sh.id}>
                        {sh.name}
                      </MenuItem>
                    ))}
                  </Field.Select>
                  <Field.Text
                    name="pieces"
                    label="Pieces *"
                    type="number"
                    placeholder="Number of pieces in the packet"
                    InputLabelProps={{ shrink: true }}
                  />
                  <Field.Text
                    name="packet_weight"
                    label="Packet Weight *"
                    InputLabelProps={{ shrink: true }}
                  />
                  <Field.Text
                    name="packet_rate"
                    label="Packet Rate *"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </DialogContent>

              <DialogActions
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 1,
                  borderTop: (theme) =>
                    `1px solid ${theme.vars ? theme.vars.palette.divider : '#e0e0e0'}`,
                }}
              >
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>
                  Create
                </LoadingButton>
              </DialogActions>
            </Form>
          ) : (
            <Form methods={bulkMethods} onSubmit={onBulkSubmit}>
              <DialogContent dividers sx={{ overflow: 'auto', maxHeight: '70vh', pb: 9 }}>
                <Stack spacing={1.5}>
                  <Controller
                    name="packets"
                    control={bulkMethods.control}
                    render={({ field }) => {
                      const handlePacketsChange = (newPackets) => {
                        // Reset sub type when main type changes
                        const updatedPackets = newPackets.map((packet, index) => {
                          const oldPacket = field.value?.[index];
                          // If main type changed, reset sub type
                          if (
                            oldPacket &&
                            oldPacket.gemstone_main_type !== packet.gemstone_main_type &&
                            packet.gemstone_main_type > 0
                          ) {
                            return { ...packet, gemstone_sub_type: 0 };
                          }
                          return packet;
                        });
                        field.onChange(updatedPackets);
                      };

                      return (
                        <DynamicFormFields
                          title="Packets"
                          fields={[
                            { name: 'packet_name', label: 'Packet Name *', type: 'text', flex: 1 },
                            {
                              name: 'packet_code',
                              label: 'Packet Code (Optional)',
                              type: 'text',
                              flex: 1,
                            },
                            {
                              name: 'gemstone_main_type',
                              label: 'Gemstone Main Type *',
                              type: 'select',
                              flex: 1,
                              options: mainTypes.map((mt) => ({
                                value: mt.id,
                                label: mt.name || mt.main_type_name || `ID: ${mt.id}`,
                              })),
                            },
                            {
                              name: 'gemstone_sub_type',
                              label: 'Gemstone Sub Type *',
                              type: 'select',
                              flex: 1,
                              options: (item) => {
                                const mainTypeId = item?.gemstone_main_type;
                                const availableSubTypes =
                                  mainTypeId && mainTypeId > 0
                                    ? subTypesByMainType[mainTypeId] || []
                                    : [];
                                return availableSubTypes.map((st) => ({
                                  value: st.id,
                                  label: st.sub_type_name || st.name,
                                }));
                              },
                            },
                            {
                              name: 'gemstone_shape',
                              label: 'Gemstone Shape *',
                              type: 'select',
                              flex: 1,
                              options: shapes.map((sh) => ({ value: sh.id, label: sh.name })),
                            },
                            { name: 'pieces', label: 'Pieces *', type: 'number', flex: 1 },
                            {
                              name: 'packet_weight',
                              label: 'Packet Weight *',
                              type: 'text',
                              flex: 1,
                            },
                            { name: 'packet_rate', label: 'Packet Rate *', type: 'text', flex: 1 },
                          ]}
                          values={field.value}
                          onChange={handlePacketsChange}
                          minItems={1}
                          maxItems={50}
                        />
                      );
                    }}
                  />
                </Stack>
              </DialogContent>

              <DialogActions
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 1,
                  borderTop: (theme) =>
                    `1px solid ${theme.vars ? theme.vars.palette.divider : '#e0e0e0'}`,
                }}
              >
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isBulkSubmitting || loading}
                >
                  Create
                </LoadingButton>
              </DialogActions>
            </Form>
          )}
        </>
      )}
    </Dialog>
  );
}
