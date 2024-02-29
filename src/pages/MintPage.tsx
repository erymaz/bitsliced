import 'twin.macro';

import { useContext, useEffect } from 'react';

import TopBanner from '../components/TopBanner';
import { UserContext } from '../contexts/UserContext';
import HeroSection from './MintPage/HeroSection';

export const menuItemsForMintingPages = [
  { icon: 'channel', label: 'Create a Channel', link: '/create/mint-channel' },
  { icon: 'traitsniper', label: 'Create an NFT', link: '/create/mint-nft' },
  {
    icon: 'collection',
    label: 'Create a Collection',
    link: '/create/create-collection',
  },
];

const MintPage = () => {
  const { setCustomMenuItems } = useContext(UserContext);

  useEffect(() => {
    setCustomMenuItems(menuItemsForMintingPages);
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
        <HeroSection />
      </div>
    </>
  );
};

export default MintPage;
