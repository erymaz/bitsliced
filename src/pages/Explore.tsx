import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import TopBanner from '../components/TopBanner';
import { UserContext } from '../contexts/UserContext';
// import { useEagerConnect, useWeb3Listener } from '../hooks';
import TabCollections from './Explore/TabCollections';
import TabItems from './Explore/TabItems';
import TabTradableChannelTickets from './Explore/TabTradableChannelTickets';

const tabs = [
  { icon: 'traitsniper', key: 'items', label: 'Items' },
  { icon: 'collection', key: 'collections', label: 'Collections' },
  { icon: 'channel', key: 'tradable', label: 'Tradable Channel Tickets' },
  { icon: 'activity', key: 'activities', label: 'Activities' },
];

const Explore = () => {
  // useEagerConnect();
  // useWeb3Listener();
  const [queryParams] = useSearchParams();

  const { darkMode, setCustomMenuItems } = useContext(UserContext);
  const [tab, setTab] = useState<string>(tabs[0].key);

  useEffect(() => {
    setCustomMenuItems(
      tabs.map((item) => ({
        icon: item.icon,
        label: item.label,
        link: `/explore?tab=${item.key}`,
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
    <>
      <div tw="w-full overflow-x-hidden min-h-[calc(100vh - 286px)]">
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
        <div tw="mx-auto px-4 lg:px-8 pt-6 w-full max-w-full">
          <div
            className="no-scrollbar"
            tw="flex items-center gap-6 md:gap-[52px] overflow-x-auto"
          >
            {tabs.map((item) => (
              <Link
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
                to={`/explore?tab=${item.key}`}
                tw="pb-3.5 font-normal text-base tracking-tight border-b-2 cursor-pointer whitespace-nowrap"
                // onClick={() => setTab(item.key)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div tw="py-6 w-full border-t-2 border-dark/5 dark:border-light/5">
          {tab === 'items' && <TabItems />}
          {tab === 'collections' && <TabCollections />}
          {tab === 'tradable' && <TabTradableChannelTickets />}
        </div>
      </div>
    </>
  );
};

export default Explore;
