import 'twin.macro';

import { Link } from 'react-router-dom';

import { IChannel } from '../type.d';
import { nFormatter, sign } from '../utils';
import { getIcon } from './ColoredIcon';

const ChannelCardMockup = (props: {
  data: IChannel;
  owned?: boolean;
  small?: boolean;
}) => {
  return (
    <div
      key={props.data.title}
      css={{
        backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.179474) 29.92%, rgba(0, 0, 0, 0) 100%), url(/images/${props.data.img})`,
      }}
      tw="pt-[119.36%] relative bg-cover bg-center rounded-[32px] overflow-hidden"
    >
      <div tw="absolute left-8 top-5 right-8">
        <div tw="font-semibold text-[18px] md:text-[23px] tracking-tight leading-[150%]">
          {props.data.title}
        </div>
        <div tw="pt-1 md:pt-0 text-sm tracking-tight text-[#fff8]">
          by {props.data.user.name} ({props.data.user.address.substring(0, 8)}
          ...)
        </div>
        <div tw="pt-2 text-sm tracking-tight leading-[150%] text-[rgba(255, 255, 255, 0.8)]">
          {props.data.text}
        </div>
      </div>
      <div tw="absolute right-6 md:right-8 top-6 flex items-center gap-[5px]">
        {getIcon('sliced', '#fff')}
        <span tw="font-semibold text-base tracking-tight">
          {nFormatter(props.data.amount, 1)}
        </span>
      </div>
      <div
        css={{
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, #0008 100%)',
        }}
        tw="absolute left-0 bottom-0 right-0 pl-8 pr-6 md:pr-8 py-[15px] flex justify-between items-center backdrop-blur-md"
      >
        <div>
          <div tw="pt-3 pb-5">
            <span tw="px-[14px] py-[7px] text-sm tracking-tight border-2 border-green-500 rounded-3xl">
              {sign(props.data.increased)}
              {props.data.increased}%
            </span>
          </div>
          <div tw="flex items-center gap-[19px]">
            <div tw="flex items-center">
              {props.data.memberPictures.map((pic) => (
                <div
                  key={pic}
                  css={{ backgroundImage: `url(/images/${pic})` }}
                  tw="mr-[-14px] w-[30px] h-[30px] border bg-no-repeat bg-center bg-cover border-white rounded-full"
                />
              ))}
            </div>
            <span tw="text-sm tracking-tight">
              {nFormatter(props.data.members, 2)} member
              {props.data.members === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        {props.owned ? (
          <Link
            to={`/channels/${props.data.id}`}
            tw="px-3.5 h-10 flex items-center gap-2.5 bg-[#3169FA] rounded-3xl hover:opacity-75"
          >
            <span tw="font-semibold text-base tracking-tight">Owner</span>
          </Link>
        ) : (
          <Link
            to={`/channels/${props.data.id}`}
            tw="px-3.5 h-10 flex items-center gap-[7px] bg-[#3169FA] rounded-3xl hover:opacity-75"
          >
            {getIcon('add', '#fff')}
            <span tw="font-semibold text-base tracking-tight">Join</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ChannelCardMockup;
