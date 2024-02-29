import 'twin.macro';

const CollectionCardShimmer = () => {
  return (
    <div
      css={{ boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)' }}
      tw="bg-white dark:bg-[#fff2] rounded-lg"
    >
      <div className="animate-shimmer" tw="pt-[100%] rounded-lg" />
      <div tw="pl-2.5 pt-1 pb-2.5 pr-2.5">
        <div tw="flex items-center gap-2.5">
          <div
            className="animate-shimmer"
            tw="relative mt-[-20px] w-[80px] h-[80px] bg-[#0001] rounded-full backdrop-blur-xl"
          />
          <div tw="flex flex-col gap-[6px]">
            <div
              className="animate-shimmer"
              tw="w-[80px] h-[14px] rounded-[100px]"
            />
            <div
              className="animate-shimmer"
              tw="w-[120px] h-[14px] rounded-[100px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCardShimmer;
