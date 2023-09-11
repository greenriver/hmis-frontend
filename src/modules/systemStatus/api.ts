export const fetchSystemStatus = async (
  detailType: string
): Promise<string> => {
  const response = await fetch(`/hmis/system_status/${detailType}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.text();
};
