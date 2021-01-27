import React from 'react';
import {ImageBlock} from '@slack/web-api';

interface Props {
  children?: React.ReactChild;
  src: string;
  alt: string;
  title?: string;
}

export function Image(props: Props) {
  return (
    <component
      {...props}
      componentType="section"
      transform={(props): ImageBlock => ({
        type: 'image',
        image_url: props.src,
        alt_text: props.alt,
      })}
    />
  );
}
