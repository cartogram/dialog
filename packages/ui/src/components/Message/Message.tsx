import React from 'react';

interface Props {
  text?: string;
  children?: any;
}

export function Message(props: Props) {
  return (
    <component
      {...props}
      componentType="message"
      transform={({text}) => ({blocks: [], text})}
    />
  );
}
