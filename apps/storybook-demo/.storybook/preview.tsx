import type { Preview } from "@storybook/react";
import { Decorator } from '@storybook/react';
import '../src/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Add these to ensure clean component rendering
    layout: 'fullscreen',
    backgrounds: {
      disable: true,
    },
  },
};

export const decorators: Decorator[] = [
  Story => (
    <div id="storybook-root" style={{ margin: 0, padding: 0 }}>
      <Story/>
    </div>
  )
];

export default preview;