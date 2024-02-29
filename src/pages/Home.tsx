import 'twin.macro';

import { useContext, useEffect } from 'react';

import TopBanner from '../components/TopBanner';
import { UserContext } from '../contexts/UserContext';
// import { useEagerConnect, useWeb3Listener } from '../hooks';
import CreateAccountVideoSection from './Home/CreateAccountVideoSection';
import HomeHeroSection from './Home/HomeHeroSection';
import HottestCollections24 from './Home/HottestCollections24';
import TrendingChannels24 from './Home/TrendingChannels24';

const Home = () => {
  // useEagerConnect();
  // useWeb3Listener();
  const { setCustomMenuItems } = useContext(UserContext);

  useEffect(() => {
    setCustomMenuItems(undefined);
  });

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
        <HomeHeroSection />
        <TrendingChannels24 />
        <HottestCollections24 />
        <CreateAccountVideoSection />
      </div>
    </>
  );
};

export default Home;
