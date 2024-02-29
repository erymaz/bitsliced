import 'twin.macro';

import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';

const HeroSection = () => {
  const { darkMode } = useContext(UserContext);
  return (
    <section tw="w-full">
      <div tw="pt-8 pb-8 flex flex-col md:flex-row justify-center items-center">
        <div tw="flex justify-start px-4 lg:px-8 w-full lg:w-[50%]">
          <div tw="m-auto max-w-xl">
            <h2 tw="text-3xl md:text-5xl font-semibold tracking-tight leading-[110%] text-dark dark:text-light/90">
              Create a channel, your own work, or create a collection.
            </h2>
            <p tw="pt-[30px] md:pt-12 flex items-center gap-3.5 flex-wrap">
              <Link
                to="/create/mint-channel"
                tw="px-3.5 h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
              >
                Create a Channel
              </Link>
              <Link
                to="/create/mint-nft"
                tw="px-3.5 h-10 flex items-center gap-[7px] text-dark dark:text-light/90 tracking-tight rounded-lg  bg-transparent dark:bg-transparent border-2 border-gray-500"
              >
                Create an NFT
              </Link>
              <Link
                to="/create/create-collection"
                tw="px-3.5 h-10 flex items-center gap-[7px] text-dark dark:text-light/90 tracking-tight rounded-lg  bg-transparent dark:bg-transparent border-2 border-gray-500"
              >
                Create a Collection
              </Link>
            </p>
            <div tw="w-[100px] h-10 md:h-[60px] border-b-[1px] border-dark/10 dark:border-light/10" />
            <div tw="pt-[27px] pb-[60px] md:pb-0">
              <Link to="" tw="pb-8 flex gap-2.5 items-center">
                {getIcon('play', darkMode ? '#fff' : '#000')}
                <span tw="font-medium text-base text-dark dark:text-light">
                  Create a Channel
                </span>
              </Link>
              <Link to="" tw="pb-8 flex gap-2.5 items-center">
                {getIcon('play', darkMode ? '#fff' : '#000')}
                <span tw="font-medium text-base text-dark dark:text-light">
                  Create an NFT
                </span>
              </Link>
              <Link to="" tw="flex gap-2.5 items-center">
                {getIcon('play', darkMode ? '#fff' : '#000')}
                <span tw="font-medium text-base text-dark dark:text-light">
                  Create a Collection
                </span>
              </Link>
            </div>
          </div>
        </div>
        <div tw="w-full lg:w-[50%]">
          <div tw="flex">
            <div
              css={{
                backgroundImage: 'url(/images/mintpage-hero.jpg)',
              }}
              tw="relative w-full min-h-[553px] bg-center bg-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
