import 'twin.macro';

import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';
import useWindowSize, { breakpoints } from '../../contexts/useWindowSize';

export const data = [
  {
    pic: 'cat1.jpg',
    subtitle: 'Trending over last 24 hours',
    title: 'Collectibles',
  },
  {
    pic: 'cat2.jpg',
    subtitle: 'Trending over last 24 hours',
    title: 'Digital Art',
  },
  { pic: 'cat3.jpg', subtitle: '', title: 'Music' },
  { pic: 'cat4.jpg', subtitle: '', title: 'Domain Names' },
  { pic: 'cat5.jpg', subtitle: '', title: 'Trading Cards' },
  { pic: 'cat6.jpg', subtitle: '', title: 'Sports' },
  {
    pic: 'cat7.jpg',
    subtitle: 'Trending over last 24 hours',
    title: 'Charity',
  },
  {
    pic: 'cat8.jpg',
    subtitle: 'Trending over last 24 hours',
    title: 'Vehicles',
  },
  { pic: 'cat9.jpg', subtitle: '', title: 'Photography' },
  { pic: 'cat10.jpg', subtitle: '', title: 'Utility' },
  { pic: 'cat11.jpg', subtitle: '', title: 'Luxury Goods' },
  {
    pic: 'cat12.jpg',
    subtitle: 'Trending over last 24 hours',
    title: 'Real Estate',
  },
  { pic: 'cat13.jpg', subtitle: '', title: 'Events' },
  { pic: 'cat14.jpg', subtitle: '', title: 'Games' },
  { pic: 'cat15.jpg', subtitle: '', title: 'Virtual Worlds' },
];

const CategoriesSection = () => {
  const { darkMode } = useContext(UserContext);
  const [limit, setLimit] = useState<number>(5);
  const [filteredData, setFilteredData] =
    useState<{ pic: string; title: string; subtitle: string }[]>(data);
  const size = useWindowSize();
  const scrl = useRef<HTMLDivElement>(null);

  const [scrolStart, setscrolStart] = useState<boolean>(true);
  const [scrolEnd, setscrolEnd] = useState<boolean>(false);

  useEffect(() => {
    if (size.width < breakpoints.md) {
      setFilteredData(data.slice(0, limit));
    } else {
      setFilteredData(data.slice(0, 15));
    }
  }, [limit, size]);

  const slide = (shift: number) => {
    if (scrl.current) {
      scrl.current.scrollLeft += shift;
      scrollCheck();
    }
  };

  const scrollCheck = () => {
    if (scrl.current) {
      if (
        Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <=
        scrl.current.offsetWidth
      ) {
        setscrolEnd(true);
      } else {
        setscrolEnd(false);
      }
      if (Math.floor(scrl.current.scrollLeft) <= 5) {
        setscrolStart(true);
      } else {
        setscrolStart(false);
      }
    }
  };

  return (
    <section tw="w-full pt-[60px] md:pt-[200px]">
      <h2 tw="relative px-4 text-[24px] md:text-[50px] font-semibold leading-[120%] text-left md:text-center text-dark dark:text-light/90">
        Categories.
        <button
          css={{ opacity: scrolStart ? 0.3 : 1 }}
          tw="px-2 py-1 absolute right-[42px] bottom-0 rotate-90 scale-75 bg-[#0002] dark:bg-[#fff2] rounded-lg z-20"
          onClick={() => slide(-50)}
        >
          {getIcon('dropdown', darkMode ? '#fff' : '#000')}
        </button>
        <button
          css={{ opacity: scrolEnd ? 0.3 : 1 }}
          tw="px-2 py-1 absolute right-2 bottom-0 -rotate-90 scale-75 bg-[#0002] dark:bg-[#fff2] rounded-lg z-20"
          onClick={() => slide(+50)}
        >
          {getIcon('dropdown', darkMode ? '#fff' : '#000')}
        </button>
      </h2>
      <div
        ref={scrl}
        className="no-scrollbar"
        tw="pt-[30px] md:pt-[60px] w-full overflow-x-auto"
      >
        <div tw="px-0 w-[1670px] flex justify-center items-center flex-wrap gap-3.5 md:gap-5">
          {filteredData.map((item) => (
            <Link
              key={item.title}
              to={`/category/${item.title.replaceAll(' ', '-').toLowerCase()}`}
              tw="relative w-auto h-[150px] rounded-2xl overflow-hidden"
            >
              <img
                alt="cat"
                src={`/images/${item.pic}`}
                tw="w-full h-full object-cover"
              />
              <div tw="absolute z-10 left-0 top-0 w-full h-full flex flex-col justify-center items-center gap-2.5 bg-[#0008]">
                <div tw="font-semibold text-[23px] tracking-tight leading-[150%] text-light/90">
                  {item.title}
                </div>
                {item.subtitle && item.subtitle.length > 0 ? (
                  <div tw="px-3.5 h-[35px] flex justify-center items-center font-medium text-sm text-center tracking-tight border-2 border-white text-light/90 bg-[rgba(0, 0, 0, 0.05)] rounded-[100px]">
                    {item.subtitle}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div tw="pt-[40px] flex md:hidden justify-center">
        <button
          tw="h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5"
          onClick={() => setLimit(15)}
        >
          View all
        </button>
      </div>
    </section>
  );
};

export default CategoriesSection;
