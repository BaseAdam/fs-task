import { Button } from '../../button';
import { IProduct } from '../../../interfaces/product';
import { parseCurrency } from '../../../utils/parseCurrency';
import { useCartContext } from '../../../contexts/cart';
import { EnergyBadge } from '../../badge/Energy';

export const ProductCard = (props: IProduct) => {
  const { items, setItems } = useCartContext();
  const { code, name, capacity, color, dimensions, features, energyClass, price, image } = props;
  const { value, currency, installment, validTo, validFrom } = price;
  const parseTitle = `${code}, ${name}, ${capacity}kg, ${color}`;
  const parseFeatures = features.join(', ');

  const addToCart = (product: IProduct) => {
    setItems([...items, product]);
  };

  const removeFromCart = (product: IProduct) => {
    const filteredItems = items.filter((item) => item.code !== product.code);
    setItems(filteredItems);
  };

  const isInCart = items.some((item) => item.code === code);

  const handleAddToCart = () => {
    isInCart ? removeFromCart(props) : addToCart(props);
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl p-6">
      <div className={'flex justify-center mb-4'}>
        <img src={image} alt={name} className="h-48 object-cover rounded-2xl" />
      </div>
      <h3 className="text-lg text-black font-bold mb-9">{parseTitle}</h3>
      <p className="text-xs text-gray-500">
        Pojemność(kg): <span className="text-black font-bold">{capacity}</span>
      </p>
      <p className="text-xs text-gray-500">
        Wymiary(GxSxW): <span className="text-black font-bold">{dimensions}</span>
      </p>
      <p className="text-xs text-gray-500 mb-3.5">
        Funkcje: <span className="text-black font-bold">{parseFeatures}</span>
      </p>
      <div className="flex items-center mb-3.5 gap-2">
        <p className="text-xs text-gray-500">Klasa energetyczna</p>
        <EnergyBadge energyClass={energyClass} />
      </div>
      <p className="text-xs text-gray-500">
        Cena obowiązuje od {validFrom.toLocaleDateString()} do {validTo.toLocaleDateString()}
      </p>
      <div className="mb-3 flex items-center gap-x-1">
        <h5 className="text-4xl text-black font-bold">{parseCurrency(value).unit}</h5>
        <div className="text-right">
          <div className="text-sm leading-4 text-black font-bold">
            {parseCurrency(value).decimal}
          </div>
          <div className="text-sm leading-4 text-black font-bold">{currency}</div>
        </div>
      </div>
      <p className="text-base text-gray-700 font-bold mb-4">
        {installment.value} {currency} x {installment.period} rat
      </p>
      <div className="flex justify-center mt-auto">
        <Button
          variant={isInCart ? 'secondary' : 'primary'}
          value={isInCart ? 'Wybrano' : 'Wybierz'}
          onClick={handleAddToCart}
        />
      </div>
    </div>
  );
};
