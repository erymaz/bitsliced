import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import TopBanner from '../components/TopBanner';
import { UserContext } from '../contexts/UserContext';
// import { useEagerConnect, useWeb3Listener } from '../hooks';
import ChannelDashboardHeroSection from './ChannelDashboard/ChannelDashboardHeroSection';
import TabChannelsExplore from './ChannelDashboard/TabChannelsExplore';
import TabCreatedChannels from './ChannelDashboard/TabCreatedChannels';
import TabJoinedChannels from './ChannelDashboard/TabJoinedChannels';
import TabTradableChannelTickets from './ChannelDashboard/TabTradableChannelTickets';

const tabs = [
  { icon: 'large-grid', key: 'explore', label: 'Explore' },
  { icon: 'channel', key: 'joined', label: 'Joined Channels' },
  { icon: 'channel', key: 'created', label: 'Created Channels' },
  { icon: 'listing', key: 'tradable', label: 'Channel Tickets' },
];

const ChannelDashboard = () => {
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
        link: `/channels?tab=${item.key}`,
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
        <ChannelDashboardHeroSection />
        <div tw="mx-auto px-4 lg:px-8 pt-8 w-full max-w-full">
          <div
            className="no-scrollbar"
            tw="w-full flex justify-start items-center gap-6 md:gap-[52px] overflow-x-auto"
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
                to={`/channels?tab=${item.key}`}
                tw="pb-3.5 font-medium text-sm md:text-base tracking-tight border-b-2 cursor-pointer whitespace-nowrap"
                // onClick={() => setTab(item.key)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div tw="py-8 w-full border-t-2 border-dark/10 dark:border-light/5">
          {tab === 'explore' && (
            <TabChannelsExplore
              openPopup={function (): void {
                throw new Error('Function not implemented.');
              }}
            />
          )}
          {tab === 'joined' && (
            <TabJoinedChannels gotoExplore={() => setTab('explore')} />
          )}
          {tab === 'created' && (
            <TabCreatedChannels gotoExplore={() => setTab('explore')} />
          )}
          {tab === 'tradable' && <TabTradableChannelTickets />}
        </div>
      </div>
    </>
  );
};

export default ChannelDashboard;
