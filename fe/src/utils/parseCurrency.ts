export const parseCurrency = (value: number) => {
  const [unit, decimal] = value.toString().split('.');
  const roundedDecimal = decimal ? Math.round(Number(`0.${decimal}`) * 100) : '00';

  return {
    unit,
    decimal: roundedDecimal,
  };
};
