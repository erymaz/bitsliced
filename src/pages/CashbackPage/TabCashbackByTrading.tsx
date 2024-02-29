import 'twin.macro';

import { useContext } from 'react';

import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';

const TabCashbackByTrading = () => {
  const { darkMode } = useContext(UserContext);

  return (
    <div tw="mx-auto pb-10 w-full max-w-[1392px]">
      <div tw="pb-8 w-full flex justify-center md:justify-between items-center flex-wrap gap-6">
        <div tw="flex justify-center md:justify-start items-center gap-[14px] flex-wrap">
          <div tw="px-[17px] flex h-10 items-center gap-2.5 bg-white dark:bg-[#fff2] rounded-3xl">
            {getIcon('search', darkMode ? '#fff8' : '#0008')}
            <input
              placeholder="Search a Channel"
              tw="text-base tracking-tight text-dark dark:text-light/90 bg-transparent outline-none"
              type="search"
            />
          </div>
          <div tw="flex items-center gap-[5px] cursor-pointer">
            <span tw="text-base tracking-tight text-dark dark:text-light/90">
              Sort by
            </span>
            <span tw="font-semibold text-base tracking-tight text-dark dark:text-light">
              Price low to high
            </span>
            {getIcon('dropdown', darkMode ? '#fff' : '#000')}
          </div>
        </div>
        <div tw="flex items-center gap-6">
          <span tw="font-semibold text-base tracking-tight text-center text-dark dark:text-light/90">
            [Number] of total Cashback received
          </span>
        </div>
      </div>
    </div>
  );
};

export default TabCashbackByTrading;
