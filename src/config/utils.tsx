type ReturnType = { [x: string]: any };

export async function fetchTheme(which: string): Promise<ReturnType> {
  const response = await fetch(`/hmis/theme?id=${which}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (response.status !== 200) {
    console.error('Failed to fetch theme');
    return Promise.resolve({});
  } else {
    return response.json() as Promise<ReturnType>;
  }
}

export async function fetchThemes(): Promise<ReturnType> {
  const response = await fetch(`/hmis/themes`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (response.status !== 200) {
    console.error('Failed to fetch theme');
    return Promise.resolve([]);
  } else {
    return response.json() as Promise<ReturnType>;
  }
}
