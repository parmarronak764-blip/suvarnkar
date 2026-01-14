import { RHFRating } from './rhf-rating';
import { RHFSlider } from './rhf-slider';
import { RHFTextField } from './rhf-text-field';
import { RHFRadioGroup } from './rhf-radio-group';
import { RHFPhoneInput } from './rhf-phone-input';
import { RHFAutocomplete } from './rhf-autocomplete';
import { RHFCountrySelect } from './rhf-country-select';
import { RHFSwitch, RHFMultiSwitch } from './rhf-switch';
import { RHFSelect, RHFMultiSelect } from './rhf-select';
import { RHFCheckbox, RHFMultiCheckbox } from './rhf-checkbox';
import { RHFDatePicker, RHFTimePicker, RHFDateTimePicker } from './rhf-date-picker';
import { RHFUploadAvatar } from './rhf-upload';

// ----------------------------------------------------------------------

export const Field = {
  Select: RHFSelect,
  Switch: RHFSwitch,
  Slider: RHFSlider,
  Rating: RHFRating,
  Text: RHFTextField,
  Phone: RHFPhoneInput,
  Checkbox: RHFCheckbox,
  RadioGroup: RHFRadioGroup,
  MultiSelect: RHFMultiSelect,
  MultiSwitch: RHFMultiSwitch,
  Autocomplete: RHFAutocomplete,
  MultiCheckbox: RHFMultiCheckbox,
  CountrySelect: RHFCountrySelect,
  // Pickers
  DatePicker: RHFDatePicker,
  TimePicker: RHFTimePicker,
  DateTimePicker: RHFDateTimePicker,
  // Upload
  UploadAvatar: RHFUploadAvatar,
};
