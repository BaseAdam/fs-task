import { EnergyClass } from '../../../interfaces/product';

interface EnergyBadgeProps {
  energyClass: EnergyClass;
}

export const EnergyBadge = ({ energyClass }: EnergyBadgeProps) => {
  return (
    <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
      {energyClass}
    </span>
  );
};
