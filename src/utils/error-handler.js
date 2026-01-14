export function extractErrorMessage(errorData, fallbackMessage = 'An error occurred. Please try again.') {
  // Handle null, undefined, or empty cases
  if (!errorData) {
    return fallbackMessage;
  }

  // Handle string errors directly
  if (typeof errorData === 'string') {
    return errorData;
  }

  // Handle array errors
  if (Array.isArray(errorData)) {
    return errorData.join(', ');
  }

  // Handle object errors
  if (typeof errorData === 'object') {
    // Check for 'errors' field (most specific)
    if (errorData.errors) {
      if (Array.isArray(errorData.errors)) {
        return errorData.errors.join(', ');
      } else if (typeof errorData.errors === 'object' && errorData.errors !== null) {
        // Extract all values from any keys in errors object
        const allErrors = Object.values(errorData.errors).flat();
        return allErrors.join(', ');
      } else {
        return String(errorData.errors);
      }
    }

    // Handle cases where the entire errorData object contains field names as keys with array values
    const fieldErrors = [];
    for (const [fieldName, fieldValue] of Object.entries(errorData)) {
      // Skip common non-error fields
      if (['success', 'data', 'message', 'error', 'detail', 'status', 'code'].includes(fieldName)) {
        continue;
      }
      
      if (Array.isArray(fieldValue)) {
        // Join field errors: "fieldName: error1, error2"
        const fieldErrorText = fieldValue.join(', ');
        fieldErrors.push(`${fieldName}: ${fieldErrorText}`);
      } else if (typeof fieldValue === 'string' && fieldValue.trim()) {
        fieldErrors.push(`${fieldName}: ${fieldValue}`);
      }
    }
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join('; ');
    }

    // Check for 'message' field
    if (errorData.message) {
      return errorData.message;
    }

    // Check for 'error' field
    if (errorData.error) {
      return errorData.error;
    }

    // Check for 'detail' field
    if (errorData.detail) {
      return errorData.detail;
    }

    // Check for nested data fields
    if (errorData.data) {
      if (errorData.data.detail) {
        return errorData.data.detail;
      }
      if (errorData.data.message) {
        return errorData.data.message;
      }
      if (errorData.data.error) {
        return errorData.data.error;
      }
    }

    // If it's an object but no recognized fields, try to extract any string values
    const values = Object.values(errorData);
    const stringValues = values.filter(value => typeof value === 'string' && value.trim());
    if (stringValues.length > 0) {
      return stringValues.join(', ');
    }
  }

  // Fallback to default message
  return fallbackMessage;
}

export function getApiErrorMessage(result, error = null, defaultMessage = 'Operation failed. Please try again.') {
  // Handle API result object (when API call succeeds but returns error state)
  if (result && !result.success) {
    return extractErrorMessage(result, defaultMessage);
  }

  // Handle error object from catch block (network errors, API errors, etc.)
  if (error) {
    // Check if it's an axios error with response data
    if (error.response?.data) {
      return extractErrorMessage(error.response.data, defaultMessage);
    }
    
    // Check if error has a message
    if (error.message) {
      return error.message;
    }
  }

  return defaultMessage;
}