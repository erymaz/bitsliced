import 'twin.macro';

import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';

const byTrading = [
  { coin: 'sliced-small', value: '1,134.27', valueUsd: '567.14', width: 20 },
  { coin: 'ethereum', value: '0.0014', valueUsd: '1.86', width: 24 },
  { coin: 'weth', value: '0.00078', valueUsd: '1.04', width: 24 },
  { coin: 'matic', value: '3.64', valueUsd: '2.86', width: 24 },
];

const HeroSection = () => {
  const { darkMode } = useContext(UserContext);

  return (
    <section tw="w-full">
      <div tw="mx-auto px-4 lg:px-8 pt-8 w-full max-w-full">
        <h2 tw="font-semibold text-3xl md:text-5xl tracking-tight leading-[110%] text-dark dark:text-light/90">
          Cashback
        </h2>
        <div tw="pt-4 lg:pt-8 w-full max-w-[1020px] grid grid-cols-1 md:grid-cols-2 gap-4">
          <div tw="p-8 bg-white dark:bg-white/5 rounded-lg">
            <h3 tw="font-semibold text-lg lg:text-2xl tracking-tight leading-[150%] text-gray-500 ">
              Total earned Cashback
            </h3>
            <div tw="pt-3.5 font-semibold text-xl lg:text-3xl tracking-tight leading-[150%] text-dark dark:text-light/90">
              $790.89
            </div>
            <Link to="" tw="pt-8 flex gap-3 items-center">
              {getIcon('play', darkMode ? '#fff' : '#000')}
              <span tw="font-semibold text-base text-dark dark:text-light">
                How to earn Cashback?
              </span>
            </Link>
          </div>
          <div tw="p-8 bg-white dark:bg-white/5 rounded-lg">
            <h3 tw="font-semibold text-lg lg:text-2xl tracking-tight leading-[150%] text-gray-500 ">
              Cashback earned by trading
            </h3>
            <div tw="pt-3.5 flex flex-col gap-3.5">
              {byTrading.map((item) => (
                <div
                  key={`trading-${item.coin}`}
                  tw="flex items-center gap-[7px]"
                >
                  <div tw="w-[24px] flex justify-center">
                    {getIcon(item.coin, darkMode ? '#fff' : '#000')}
                  </div>
                  <span tw="font-semibold text-base lg:text-xl tracking-tight leading-[150%] text-dark dark:text-light/90">
                    {item.value}
                  </span>
                  <span tw="pl-[3px] text-sm tracking-tight text-[#4D4D4D] dark:text-[#c2c2c2]">
                    (${item.valueUsd})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
