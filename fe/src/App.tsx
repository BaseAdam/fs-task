import { ErrorBoundary } from 'react-error-boundary';

import { Products } from './components/products';
import { Filters } from './components/filters';
import { FiltersProvider } from './contexts/filters';

const FallbackError = () => (
  <p className="text-center text-red-700 text-xl mt-8">
    Coś poszło nie tak. Odśwież stronę i spróbuj ponownie.
  </p>
);

function App() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto max-w-5xl">
        <ErrorBoundary FallbackComponent={FallbackError}>
          <FiltersProvider>
            <Filters />
            <Products />
          </FiltersProvider>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
