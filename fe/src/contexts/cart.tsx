import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { IProduct } from '../interfaces/product';

interface CartContextType {
  items: IProduct[];
  setItems: (items: IProduct[]) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  setItems: () => null,
});

export const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<IProduct[]>([]);

  const value = useMemo(
    () => ({
      items,
      setItems,
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
