import React from 'react';

// import {Logger} from '../../logger';

interface HomeProps {
  /** An array of Actions, Context, Divider, ImageBlock, or Section components	 */
  children?: any;

  /** A callback ran when home app is loaded. */
  onLoad?: (event: any) => Promise<void> | void;
}

/**
 * The Home tab is a persistent, yet dynamic interface for apps that lives within the App Home.
 */
export function Home(props: HomeProps) {
  return (
    <component
      {...props}
      componentType="home"
      transform={() => {
        const instance: any = {
          type: 'home',
          blocks: [],
        };

        return instance;
      }}
    />
  );
}
