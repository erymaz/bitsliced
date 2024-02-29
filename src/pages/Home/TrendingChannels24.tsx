import 'twin.macro';

import { useContext, useEffect, useState } from 'react';

import { Channel } from '../../api/api';
import ChannelCard from '../../components/ChannelCard';
import { getIcon } from '../../components/ColoredIcon';
import MultiCarousel from '../../components/lib/multi-carousel';
import { UserContext } from '../../contexts/UserContext';
import { ChannelData } from '../../type.d';

const TimeOptions: { [key: string]: string } = {
  '1h': '1 hour',
  '24h': '24 hours',
  '30d': '30 days',
  '7d': '7 days',
};

const TrendingChannels24 = () => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>('24h');
  const [current, setCurrent] = useState<number>(0);
  const [show, setShow] = useState<number>(1);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [limit, setLimit] = useState<number>(8);
  const { darkMode } = useContext(UserContext);

  useEffect(() => {
    Channel.search({
      categories: [],
      channel_creator: '',
      channel_joined: '',
      channel_name: '',
      channel_owner: '',
      limit,
      page: 1,
      sortStr: 'Most visited',
    })
      .then((res) => {
        setChannels(res.channels);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [limit]);

  return (
    <section tw="w-full pt-[60px] md:pt-[200px] overflow-hidden">
      <h2 tw="flex px-4 justify-start md:justify-center items-center gap-2 flex-wrap  text-left md:text-center">
        <span tw="text-2xl md:text-4xl font-semibold leading-[120%] text-dark/60 dark:text-light/60">
          Popular channels{' '}
          <span tw="hidden md:inline text-2xl md:text-4xl">over</span>
        </span>
        <div
          tw="relative flex text-left items-center gap-2 cursor-pointer"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span tw="text-2xl md:text-4xl font-semibold leading-[120%] text-dark dark:text-light">
            last {TimeOptions[selectedTime]}
          </span>
          <div
            css={showDropdown ? { transform: 'rotate(180deg)' } : {}}
            tw="w-[32px] lg:w-[40px] h-[32px] lg:h-[40px] inline-flex justify-center items-center bg-dark dark:bg-light rounded-full duration-300"
          >
            {getIcon('dropdown', darkMode ? '#000' : '#fff')}
          </div>

          {showDropdown && (
            <>
              <div
                tw="fixed left-0 top-0 w-full h-full z-20"
                onClick={() => setShowDropdown(false)}
              />
              <ul
                className="dropdown-list"
                tw="absolute left-0 md:right-3 top-[40px] md:top-[60px] w-full flex flex-col gap-[1px] shadow-lg bg-dark/10 dark:bg-light/5 backdrop-blur-lg rounded-lg z-30"
              >
                {Object.keys(TimeOptions).map((item) => (
                  <li
                    key={item}
                    tw="py-2 md:py-4 font-semibold text-base md:text-lg text-center text-dark dark:text-light hover:bg-dark/5 dark:hover:bg-light/5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedTime(item);
                      setShowDropdown(false);
                    }}
                  >
                    {TimeOptions[item]}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </h2>
      <div
        className="no-scrollbar"
        tw="mx-auto pt-8 md:pt-14 px-4 w-full grid grid-cols-items-large md:grid-cols-items-xl auto-cols-[minmax(275px,1fr)] md:auto-cols-[minmax(335px,1fr)] grid-flow-col overflow-x-auto gap-3"
      >
        {channels.map((item) => (
          <ChannelCard key={`channel1-${item._id}`} small data={item} />
        ))}
      </div>
    </section>
  );
};

export default TrendingChannels24;
