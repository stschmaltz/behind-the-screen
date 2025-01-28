export const generateMongoId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const machineId = Math.floor(Math.random() * 16777216)
    .toString(16)
    .padStart(6, '0');
  const processId = Math.floor(Math.random() * 65536)
    .toString(16)
    .padStart(4, '0');
  const counter = Math.floor(Math.random() * 16777216)
    .toString(16)
    .padStart(6, '0');

  return timestamp + machineId + processId + counter;
};
