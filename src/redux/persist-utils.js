import { persistor } from './store';

// Utility function to clear all persisted data
export const clearPersistedData = async () => {
  try {
    await persistor.purge();
  } catch (error) {
    console.error('Error clearing persisted data:', error);
  }
};

// Utility function to pause persistence
export const pausePersistence = () => {
  persistor.pause();
};

// Utility function to resume persistence
export const resumePersistence = () => {
  persistor.persist();
};

// Utility function to get current persistence state
export const getPersistenceState = () => persistor.getState();
