import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import TopBanner from '../components/TopBanner';
import { UserContext } from '../contexts/UserContext';
import HeroSection from './CashbackPage/HeroSection';
import TabCashbackByJoining from './CashbackPage/TabCashbackByJoining';
import TabCashbackByTrading from './CashbackPage/TabCashbackByTrading';
import TabTotalCashback from './CashbackPage/TabTotalCashback';

const tabs = [
  { icon: 'cashback', key: 'total-cashback', label: 'Total Cashback' },
  {
    icon: 'transfer',
    key: 'cashback-by-trading',
    label: 'Cashback by trading',
  },
  {
    icon: 'channel',
    key: 'cashback-by-joining',
    label: 'Cashback by joining Channels',
  },
];

const CashbackPage = () => {
  const [queryParams] = useSearchParams();
  const { darkMode, setCustomMenuItems } = useContext(UserContext);

  const [tab, setTab] = useState<string>(tabs[0].key);

  useEffect(() => {
    setCustomMenuItems(
      tabs.map((item) => ({
        icon: item.icon,
        label: item.label,
        link: `/earn?tab=${item.key}`,
      }))
    );
  }, [setCustomMenuItems]);

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab) {
      setTab(tab);
    }
  }, [queryParams]);

  return (
    <div tw="w-full min-h-[calc(100vh - 286px)]">
      <TopBanner
        text={
          <>
            Create
            <span tw="hidden md:inline text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {' '}
              your own
            </span>{' '}
            Channel without any fee for the first 2 Months.
            <span tw="hidden md:inline text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {' '}
              Read our article
            </span>
          </>
        }
      />
      <HeroSection />
      <div tw="mx-auto px-4 pt-8 w-full max-w-full">
        <h3 tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
          Cashback History
        </h3>
        <div
          className="no-scrollbar"
          tw="px-[14px] pt-8 flex items-center gap-[52px] overflow-x-auto"
        >
          {tabs.map((item) => (
            <div
              key={item.key}
              css={
                item.key === tab
                  ? {
                      borderColor: darkMode ? '#fff' : '#000',
                      color: darkMode ? '#fff' : '#000',
                    }
                  : {
                      borderColor: 'transparent',
                      color: darkMode ? '#fff8' : '#0008',
                    }
              }
              tw="pb-3.5 font-semibold text-base tracking-tight whitespace-nowrap border-b-2 cursor-pointer"
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
      <div tw="py-8 w-full border-t-2 border-dark/10 dark:border-light/5">
        {tab === 'total-cashback' && <TabTotalCashback />}
        {tab === 'cashback-by-trading' && <TabCashbackByTrading />}
        {tab === 'cashback-by-joining' && <TabCashbackByJoining />}
      </div>
    </div>
  );
};

export default CashbackPage;
