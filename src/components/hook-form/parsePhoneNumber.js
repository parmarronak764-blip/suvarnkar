import { parsePhoneNumber } from 'react-phone-number-input';
import { toast } from 'src/components/snackbar';

export function parsePhoneField(value, fieldLabel = 'Phone number', isErrorTost = false) {
  const parsed = parsePhoneNumber(value);
  let error = null;
  if (!parsed) {
    if (isErrorTost) {
      error = `Please enter a valid ${fieldLabel}.`;
      toast.error(error);
    }
    return {
      error: error,
      countryCode: null,
      number: null,
    };
  }

  const number = getValidNumber(parsed.nationalNumber);
  return {
    error: error,
    countryCode: `+${parsed.countryCallingCode}`,
    number: number,
  };
}

export function getCompleteNumber(code = '+91', number = '') {
  return `${code}${getValidNumber(number)}`;
}

const InValid = ['', undefined, null, 'null', 'undefined'];

function getValidNumber(number = '') {
  if (InValid.includes(number) || !number) return '';
  if (number.startsWith('0')) number = number.replace('0', '');
  return number;
}
