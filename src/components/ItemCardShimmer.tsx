import 'twin.macro';

import { StyledButton } from './lib/StyledComponents';

const ItemCardShimmer = () => {
  return (
    <div tw="bg-white dark:bg-[#fff1] rounded-lg">
      <div
        className="animate-shimmer"
        tw="pt-[100%] relative bg-[#0001] dark:bg-[#fff1] rounded-lg"
      />
      <div tw="p-2.5">
        <div
          className="animate-shimmer"
          tw="w-[100px] h-[10px] bg-[#0004] dark:bg-[#fff4] rounded-[100px]"
        />
        <div
          className="animate-shimmer"
          tw="mt-1 w-[150px] h-[12px] bg-[#0004] dark:bg-[#fff4] rounded-[100px]"
        />
        <div
          className="animate-shimmer"
          tw="mt-2.5 w-[60px] h-[14px] bg-[#0004] dark:bg-[#fff4] rounded-[100px]"
        />
        <StyledButton tw="mt-[22px] w-full" />
        <StyledButton outlined tw="mt-[10px] w-full" />
      </div>
    </div>
  );
};

export default ItemCardShimmer;
