const getManageAccountLink = () => {
  if (!import.meta.env.PUBLIC_WAREHOUSE_URL) return null;

  return `${import.meta.env.PUBLIC_WAREHOUSE_URL.replace(
    /\/+$/,
    ''
  )}/account/edit`;
};

export default getManageAccountLink;
