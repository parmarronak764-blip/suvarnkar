const setItem = (key, value) => localStorage.setItem(key, value);

const getItem = (key) => localStorage.getItem(key);

const removeItem = (key) => localStorage.removeItem(key);

const clearLocalStorage = () => localStorage.clear();

const getStoredValue = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('Failed to store value in localStorage');
  }
};

export { setItem, getItem, removeItem, clearLocalStorage, getStoredValue, setStoredValue };
