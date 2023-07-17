export const currentTimeInSeconds = () => {
  const now = new Date();
  return Math.ceil(now.getTime() / 1000);
};
