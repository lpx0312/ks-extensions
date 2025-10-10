import React from 'react';
import { Loading } from '@kubed/components';

const App = React.lazy(() => import('./App'));

export default function Root() {
  return (
    <React.Suspense fallback={<Loading />}>
      <App />
    </React.Suspense>
  );
}
