import 'twin.macro';

import { useContext } from 'react';

import { UserContext } from '../contexts/UserContext';
import { getIcon } from './ColoredIcon';

const SwitchControl = (props: {
  value?: boolean;
  onChange: (value: boolean) => void;
}) => {
  const { darkMode } = useContext(UserContext);

  return (
    <div
      tw="relative w-[38px] h-[38px] rounded-[100px] flex items-center justify-center cursor-pointer transition-colors duration-300" // dark: bg-[rgba(255, 255, 255, 0.2)]
      onClick={() => props.onChange(!props.value)}
    >
      <div tw="w-[24px] h-[24px] relative">
        <div css={{ opacity: darkMode ? 0 : 1 }} tw="absolute left-0 top-0">
          {getIcon('sun', darkMode ? '#BB9BFF' : '#42CAF5')}
        </div>
        <div css={{ opacity: darkMode ? 1 : 0 }}>
          {getIcon('moon', darkMode ? '#BB9BFF' : '#42CAF5')}
        </div>
      </div>
    </div>
  );
};

export default SwitchControl;
