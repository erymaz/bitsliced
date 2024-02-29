import 'twin.macro';

import { Link } from 'react-router-dom';

import iconPlayCircle from '../../assets/svgs/icon-play-white.svg';

const CreateAccountVideoSection = () => {
  return (
    <section tw="w-full px-4 lg:px-8 pt-[60px] md:pt-[200px] pb-[60px] md:pb-[210px]">
      <h2 tw="text-2xl md:text-4xl font-semibold leading-[120%] text-dark dark:text-light text-center">
        Why create a Sliced account?
      </h2>
      <div tw="pt-8 md:pt-14 mx-auto w-full max-w-[1172px]">
        <div
          css={{ backgroundImage: 'url(/images/video-thumbnail.jpg)' }}
          tw="pt-[56.25%] w-full relative bg-center bg-cover rounded-[11px] md:rounded-[32px] overflow-hidden"
        >
          <div tw="absolute left-0 top-0 right-0 bottom-0 bg-[#0008] z-10" />
          <img
            alt="play"
            src={iconPlayCircle}
            tw="absolute left-1/2 top-1/2 w-[53px] md:w-[103px] translate-x-[-50%] translate-y-[-50%] z-20 cursor-pointer hover:opacity-75"
          />
        </div>
      </div>
      <div tw="pt-10 md:pt-[60px] flex justify-center">
        <Link
          to="/join"
          tw="h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5"
        >
          Create an account
        </Link>
      </div>
    </section>
  );
};

export default CreateAccountVideoSection;
