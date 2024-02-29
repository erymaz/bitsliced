import 'twin.macro';

import { useContext } from 'react';

import { UserContext } from '../contexts/UserContext';

const SwitchControl = (props: {
  value?: boolean;
  onChange: (value: boolean) => void;
}) => {
  const { darkMode } = useContext(UserContext);

  return (
    <div
      css={{
        backgroundColor: props.value ? '#3169FA' : darkMode ? '#fff2' : '#0008',
      }}
      tw="relative w-[48px] h-[24px] rounded-[100px] cursor-pointer transition-colors duration-300" // dark: bg-[rgba(255, 255, 255, 0.2)]
      onClick={() => props.onChange(!props.value)}
    >
      <div
        css={{
          left: props.value ? 28 : 4,
        }}
        tw="absolute top-[4px] w-[16px] h-[16px] bg-white rounded-full duration-300"
      />
    </div>
  );
};

export default SwitchControl;
