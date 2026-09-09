import { useFilterContext } from '../../contexts/filters';
import { ChangeEvent } from 'react';

export const Search = () => {
  const { query, setQuery } = useFilterContext();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setQuery(value);
  };

  return (
    <input
      placeholder={'Search'}
      value={query}
      onChange={handleChange}
      className={'text-sm font-normal px-3 py-2 bg-white w-full'}
    />
  );
};
