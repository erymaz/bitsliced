import 'twin.macro';

import { Link } from 'react-router-dom';

import { getIcon } from '../components/ColoredIcon';
import TopBanner from '../components/TopBanner';

const data = [
  {
    summary:
      '[Short excerpt of explanation] Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    title: 'How to use the Sliced app?',
  },
  {
    summary:
      '[Short excerpt of explanation] Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    title: 'Why create a Sliced account?',
  },
  {
    summary:
      '[Short excerpt of explanation] Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    title: 'How to earn Cashback?',
  },
  {
    summary:
      '[Short excerpt of explanation] Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    title: 'How to use the Sliced app?',
  },
  {
    summary:
      '[Short excerpt of explanation] Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    title: 'How to use the Sliced app?',
  },
  {
    summary:
      '[Short excerpt of explanation] Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    title: 'How to use the Sliced app?',
  },
  {
    summary:
      '[Short excerpt of explanation] Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    title: 'How to use the Sliced app?',
  },
  {
    summary:
      '[Short excerpt of explanation] Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    title: 'How to use the Sliced app?',
  },
  {
    summary:
      '[Short excerpt of explanation] Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    title: 'How to use the Sliced app?',
  },
  {
    summary:
      '[Short excerpt of explanation] Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    title: 'How to use the Sliced app?',
  },
  {
    summary:
      '[Short excerpt of explanation] Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    title: 'How to use the Sliced app?',
  },
];

const HelpPage = () => {
  return (
    <div tw="w-full pb-[223px]">
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
      <h2 tw="mx-auto pt-[57px] w-full max-w-[814px] font-semibold text-[60px] tracking-tight leading-[110%] text-center text-dark dark:text-light/90">
        Do you need help?
      </h2>
      <div tw="mx-auto px-4 pt-8 w-full max-w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {data.map((item, index) => (
          <div
            key={`help-${index}`}
            tw="p-8 bg-white dark:bg-[#fff1] rounded-lg"
          >
            <h3 tw="max-w-[190px] font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
              {item.title}
            </h3>
            <p tw="pt-3.5 text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {item.summary}
            </p>
            <button tw="pt-6 font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light">
              Read more
            </button>
            <Link to="" tw="pt-[98px] flex gap-2.5 items-center">
              {getIcon('play', '#3169FA')}
              <span tw="font-semibold text-base text-dark dark:text-light">
                Play Video
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpPage;
