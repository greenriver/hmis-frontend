const getManageAccountLink = () => {
  return `${import.meta.env.PUBLIC_WAREHOUSE_URL.replace(
    /\/+$/,
    ''
  )}/account/edit`;
};

export default getManageAccountLink;
