import 'twin.macro';

import { useContext } from 'react';
import { ReactNode } from 'react';

import { UserContext } from '../contexts/UserContext';
import { getIcon } from './ColoredIcon';

const TopBanner = (props: {
  icon?: string;
  text: ReactNode;
  color?: string;
}) => {
  const { darkMode } = useContext(UserContext);
  return (
    <div tw="px-4 md:px-[34px] py-1.5 md:py-0 h-auto min-h-[46px] flex items-center gap-[7px] md:gap-2.5 bg-gradient-to-r from-hero-bluelight dark:from-hero-purpledark to-hero-bluedark dark:to-hero-purplelight">
      {getIcon('info', darkMode ? '#FFF' : '#000')}

      <div tw="font-normal text-[10px] xs:text-[12px] sm:text-[14px] md:text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
        {props.text}
      </div>
    </div>
  );
};

export default TopBanner;
