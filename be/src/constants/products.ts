export const ENERGY_CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

export const SORT_FIELDS = ['price', 'capacity'] as const;

export type SortField = (typeof SORT_FIELDS)[number];
