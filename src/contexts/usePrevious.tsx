import { MutableRefObject, useEffect, useRef } from 'react';

export const usePrevious = (value: { [key: string]: any }) => {
  const ref: MutableRefObject<any> = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
