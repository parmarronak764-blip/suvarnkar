import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

/**
 * Constructs a full image URL from a relative path
 * @param relativePath - The relative path from the backend (e.g., '/media/company_user_images/image.png')
 * @returns The full URL or empty string if no path provided
 */
export function getImageUrl(relativePath?: string | null): string {
  if (!relativePath) {
    return '';
  }
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Construct full URL with server URL
  return `${CONFIG.serverUrl}${relativePath}`;
}

/**
 * Constructs a full image URL for profile images
 * @param profileImagePath - The profile image path from the backend
 * @returns The full URL or empty string if no path provided
 */
export function getProfileImageUrl(profileImagePath?: string | null): string {
  return getImageUrl(profileImagePath);
}

/**
 * Constructs a full image URL for ID card images
 * @param idCardPath - The ID card image path from the backend
 * @returns The full URL or empty string if no path provided
 */
export function getIdCardImageUrl(idCardPath?: string | null): string {
  return getImageUrl(idCardPath);
} 

/**
 * Constructs a full image URL for company logo images
 * @param companyLogoPath - The company logo path from the backend
 * @returns The full URL or empty string if no path provided
 */
export function getCompanyLogoUrl(companyLogoPath?: string | null): string {
  return getImageUrl(companyLogoPath);
} 