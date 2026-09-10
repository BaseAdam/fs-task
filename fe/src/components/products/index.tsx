import { ChevronDown } from 'react-feather';

import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../cards/Product';
import { Button } from '../button';

export const Products = () => {
  const { products, loading, loadingMore, error, hasMore, loadMore, retry } = useProducts();

  if (loading) {
    return <p className="text-center text-gray-500 text-xl mt-4">Ładowanie produktów...</p>;
  }

  if (error && products.length === 0) {
    return (
      <div className="text-center mt-4">
        <p className="text-red-700 text-xl">Nie udało się pobrać produktów</p>
        <p className="text-gray-500 text-sm mt-1 mb-3">{error}</p>
        <Button variant={'secondary'} value={'Spróbuj ponownie'} onClick={retry} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        <p className="text-center text-gray-500 text-xl mt-4">
          Brak produktów spełniających kryteria wyszukiwania
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-x-4 gap-y-5">
        {products.map((product) => (
          <ProductCard key={product.code} {...product} />
        ))}
      </div>
      {error && <p className="text-center text-red-700 text-sm mt-4">{error}</p>}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            variant={'tertiary'}
            value={loadingMore ? 'Ładowanie...' : 'Pokaż więcej'}
            icon={<ChevronDown />}
            onClick={loadMore}
          />
        </div>
      )}
    </>
  );
};
