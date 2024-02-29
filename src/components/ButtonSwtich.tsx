import 'twin.macro';

import React from 'react';

import { StyledButton } from './lib/StyledComponents';

const ButtonSwtich = (props: {
  options: string[];
  defaultValue?: string;
  value: string | null;
  onChange: (selected: string | null) => void;
}) => {
  return (
    <div tw="flex items-center gap-3.5">
      {props.options.map((item) => (
        <React.Fragment key={item}>
          <span tw="first:hidden text-base tracking-tight text-dark dark:text-light/90">
            or
          </span>
          <StyledButton
            wide
            unselected={(props.value ?? props.defaultValue) !== item}
            onClick={() => props.onChange(item)}
          >
            {item}
          </StyledButton>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ButtonSwtich;
