export const errToString = (err) => {
  if (typeof err?.response?.data?.msg == 'string') {
    return err?.response?.data?.msg;
  }
  if (typeof err?.msg == 'string') {
    return err?.msg;
  }
  return (
    JSON.stringify(err?.response?.data?.msg) ||
    JSON.stringify(err?.msg) ||
    JSON.stringify(err) ||
    'Something went wrong'
  );
};
