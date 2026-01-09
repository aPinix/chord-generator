import type React from 'react';
import type { JSX } from 'react';

interface Provider<TProps> {
  Component: React.ComponentType<React.PropsWithChildren<TProps>>;
  props?: Omit<TProps, 'children'>;
}

function createProvider<TProps>(
  Component: React.ComponentType<React.PropsWithChildren<TProps>>,
  props?: Omit<TProps, 'children'>
): Provider<TProps> {
  return { Component, props };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function composeProviders<
  TProviders extends Array<Provider<Record<string, unknown>>>,
>(providers: TProviders): React.ComponentType<React.PropsWithChildren> {
  const ProviderComponent: React.FunctionComponent<React.PropsWithChildren> = ({
    children,
  }) => {
    const initialJSX = <>{children}</>;

    return providers.reduceRight<JSX.Element>(
      (prevJSX, { Component: CurrentProvider, props = {} }) => {
        return (
          <CurrentProvider key={CurrentProvider.name} {...props}>
            {prevJSX}
          </CurrentProvider>
        );
      },
      initialJSX
    );
  };

  return ProviderComponent;
}

export { composeProviders, createProvider };
