import 'twin.macro';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Channel } from '../../api/api';
import ChannelCard from '../../components/ChannelCard';
import { ChannelData } from '../../type';

const ChannelDashboardHeroSection = () => {
  const [bestChannel, setBestChannel] = useState<ChannelData | null>(null);

  useEffect(() => {
    Channel.search({
      categories: [],
      channel_creator: '',
      channel_joined: '',
      channel_name: '',
      channel_owner: '',
      limit: 1,
      page: 1,
      sortStr: 'Most members',
    })
      .then((res) => {
        if (res?.channels?.length > 0) {
          setBestChannel(res.channels[0]);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return (
    <section tw="w-full pt-6">
      <div tw="px-4 lg:px-8 w-full">
        <div tw="flex">
          <div
            css={{
              backgroundImage: `url(${bestChannel?.channel_background_image_url})`,
            }}
            tw="p-8 grid lg:grid-cols-2 gap-8 items-center justify-center relative w-full bg-center bg-cover rounded-lg lg:rounded-2xl shadow-xl before:absolute before:content-[''] before:w-full before:h-full before:bg-gradient-to-br before:from-black/80 before:via-black/50 before:to-black/10 before:backdrop-blur-md before:rounded-lg lg:before:rounded-2xl "
          >
            <div tw="relative z-10">
              <h2 tw="text-3xl md:text-5xl font-semibold tracking-tight leading-[110%] text-light max-w-4xl">
                Elevate your portfolio, expand your network and enrich your
                knowledge with channels.
              </h2>
              <Link
                to="/create/mint-channel"
                tw="mt-6 px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight font-medium rounded-lg bg-light/30 backdrop-blur-md text-light"
              >
                Create a Channel
              </Link>
            </div>
            <div tw="hidden lg:grid grid-cols-1 justify-self-center w-full max-w-[320px] h-full rounded-lg">
              {bestChannel && <ChannelCard data={bestChannel} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChannelDashboardHeroSection;
