import 'twin.macro';

import { Link } from 'react-router-dom';

import imgDiagram from '../../assets/svgs/lock-token-diagram.svg';
import { getIcon } from '../../components/ColoredIcon';

const LockTokenSection = () => {
  return (
    <section tw="w-full pt-[60px] md:pt-[200px] flex flex-col md:flex-row items-center gap-0 md:gap-0">
      <div tw="pl-4 pr-4 md:pr-12 w-full md:w-[44%]">
        <div tw="ml-auto w-full max-w-[449px]">
          <h2 tw="text-[24px] md:text-[50px] font-semibold tracking-tight leading-[110%] text-center md:text-left text-dark dark:text-light/90">
            Lock your tokens in exchange of commission fees.
          </h2>
          <Link
            to=""
            tw="pt-10 pb-[25px] md:pb-0 flex gap-3 justify-center md:justify-start items-center"
          >
            {getIcon('play', '#3169FA')}
            <span tw="font-semibold text-base text-dark dark:text-light ">
              How it works
            </span>
          </Link>
          <div tw="pt-[60px] hidden md:flex flex-wrap items-center gap-5">
            <button tw="px-[14px] py-[7px] font-semibold text-base tracking-tight text-light/90 bg-[#3169FA] rounded-3xl">
              Lock SLICED Tokens
            </button>
            <button tw="px-[14px] py-[7px] font-semibold text-base tracking-tight text-dark dark:text-light   border-2 border-[#3169FA] rounded-3xl">
              Lock SLICED LP Tokens
            </button>
          </div>
        </div>
      </div>
      <div
        css={{ backgroundImage: 'url(/images/lock-token-bg.jpg)' }}
        tw="pl-3 md:pl-[140px] pr-3 md:pr-4 py-6 md:py-[200px] w-full md:w-[56%] bg-[#D9D9D9] bg-no-repeat bg-center bg-cover"
      >
        <div tw="w-full max-w-none md:max-w-[674px]">
          <img
            alt="diagram"
            src={imgDiagram}
            tw="backdrop-blur-[20px] rounded-[26px]"
          />
        </div>
      </div>
      <div tw="pt-[40px] flex md:hidden flex-col items-center gap-5">
        <button tw="px-[14px] py-[7px] font-semibold text-base tracking-tight text-light/90 bg-[#3169FA] rounded-3xl">
          Lock SLICED Tokens
        </button>
        <button tw="px-[14px] py-[7px] font-semibold text-base tracking-tight text-dark dark:text-light   border-2 border-[#3169FA] rounded-3xl">
          Lock SLICED LP Tokens
        </button>
      </div>
    </section>
  );
};

export default LockTokenSection;
