import 'twin.macro';

const ChannelCardShimmer = () => {
  return (
    <div
      className="animate-shimmer"
      tw="pt-[119.36%] relative rounded-[32px] overflow-hidden"
    >
      <div
        className="animate-shimmer"
        tw="absolute left-0 bottom-0 right-0 pl-8 pr-6 md:pr-8 py-[15px] flex justify-between items-center"
      >
        <div>
          <div tw="pt-1 pb-5">
            <div tw="w-[60px] h-[32px] bg-green-500 rounded-3xl" />
          </div>
          <div tw="flex items-center gap-[19px]">
            <div tw="w-[100px] h-[32px] bg-[#fff4] rounded-3xl" />
          </div>
        </div>
        <div tw="w-[80px] h-10 bg-[#3169FA] rounded-3xl" />
      </div>
    </div>
  );
};

export default ChannelCardShimmer;
