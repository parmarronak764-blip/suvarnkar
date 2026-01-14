import { API_ROUTES } from './apiRoute';

/**
 * Constructs a full image URL from a relative path
 * @param {string|null} relativePath - The relative path from the backend (e.g., '/media/company_user_images/image.png')
 * @returns {string} The full URL or empty string if no path provided
 */
export function getImageUrl(relativePath) {
  if (!relativePath) {
    return '';
  }
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Construct full URL with server URL
  return `${API_ROUTES.BASE_URL}${relativePath}`;
}

/**
 * Constructs a full image URL for profile images
 * @param {string|null} profileImagePath - The profile image path from the backend
 * @returns {string} The full URL or empty string if no path provided
 */
export function getProfileImageUrl(profileImagePath) {
  return getImageUrl(profileImagePath);
}

/**
 * Constructs a full image URL for company logo images
 * @param {string|null} companyLogoPath - The company logo path from the backend
 * @returns {string} The full URL or empty string if no path provided
 */
export function getCompanyLogoUrl(companyLogoPath) {
  return getImageUrl(companyLogoPath);
}

/**
 * Constructs a full image URL for ID card images
 * @param {string|null} idCardPath - The ID card image path from the backend
 * @returns {string} The full URL or empty string if no path provided
 */
export function getIdCardImageUrl(idCardPath) {
  return getImageUrl(idCardPath);
}