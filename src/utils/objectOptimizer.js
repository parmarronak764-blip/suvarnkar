export function objectClean(obj) {
  const objectData = Object.keys(obj)
    .filter((key) => {
      const value = obj[key];
      return value !== null && value !== undefined && value !== '' && value !== 0;
    })
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});

  return objectData;
}
