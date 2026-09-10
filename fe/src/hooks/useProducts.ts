import { useEffect, useState } from 'react';

import { fetchProducts } from '../api/products';
import { useFilterContext } from '../contexts/filters';
import { IProduct, ProductsMeta } from '../interfaces/product';

const DEBOUNCE_MS = 400;

type ProductsData = {
  products: IProduct[];
  meta: ProductsMeta | null;
};

export function useProducts() {
  const { query, filters } = useFilterContext();

  const [data, setData] = useState<ProductsData>({ products: [], meta: null });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);

      fetchProducts({ ...filters, search: query, page: 1 }, controller.signal)
        .then((response) => {
          setData(response);
          setLoading(false);
        })
        .catch((requestError: Error) => {
          if (requestError.name === 'AbortError') {
            return;
          }

          setError(requestError.message);
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, filters, reloadToken]);

  const hasMore = data.meta !== null && data.meta.page < data.meta.totalPages;

  const loadMore = () => {
    const { meta } = data;

    if (!meta || !hasMore || loadingMore) {
      return;
    }

    setLoadingMore(true);
    setError(null);

    fetchProducts({ ...filters, search: query, page: meta.page + 1 })
      .then((response) => {
        setData((current) => ({
          products: [...current.products, ...response.products],
          meta: response.meta,
        }));
        setLoadingMore(false);
      })
      .catch((requestError: Error) => {
        setError(requestError.message);
        setLoadingMore(false);
      });
  };

  const retry = () => setReloadToken((token) => token + 1);

  return {
    products: data.products,
    meta: data.meta,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    retry,
  };
}
