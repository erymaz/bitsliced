import 'twin.macro';

import { useContext } from 'react';

import imgBg from '../assets/images/sliced-nft-bg.jpg';
import { getIcon } from '../components/ColoredIcon';
import { socialLink } from '../components/Header';
import TopBanner from '../components/TopBanner';
import { UserContext } from '../contexts/UserContext';

const SlicedNftPage = () => {
  const { darkMode } = useContext(UserContext);

  return (
    <div tw="mx-auto w-full">
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
      <h2 tw="mx-auto pt-8 md:pt-16 w-full max-w-[814px] font-semibold text-3xl md:text-5xl tracking-tight leading-[110%] text-center text-dark dark:text-light/90">
        Sliced NFT
      </h2>
      <p tw="mx-auto pt-4 md:pt-8 w-full max-w-[336px] text-base md:text-lg tracking-tight leading-[150%] text-center text-dark dark:text-light/90 ">
        Feature will be unlocked soon. Follow us on our social channels to keep
        yourself updated.
      </p>
      <ul tw="mx-auto pt-[42px] flex justify-center items-center gap-10">
        {socialLink.map((item) => (
          <li
            key={item.title}
            title={item.title}
            tw="w-7 h-7 rounded-full hover:opacity-75"
          >
            <a
              href={item.link}
              rel="noreferrer"
              target="_blank"
              tw="w-full h-full flex justify-center items-center uppercase text-light/90 hover:underline"
            >
              {getIcon(item.icon, darkMode ? '#fff' : '#000')}
            </a>
          </li>
        ))}
      </ul>
      <div tw="pt-[123px] w-full">
        <img alt="bg" src={imgBg} tw="w-full" />
      </div>
    </div>
  );
};

export default SlicedNftPage;
