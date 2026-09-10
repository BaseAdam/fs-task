type QueryValue = string | number | undefined | boolean;

export const buildQueryString = <T extends Record<string, QueryValue>>(query: T): string => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  return params.toString();
};
