import 'twin.macro';

import { useEffect, useState } from 'react';

import iconVerified from '../../assets/svgs/icon-verified.svg';
import MultiCarousel from '../../components/lib/multi-carousel';
import { IDropItem } from '../../type.d';

const data: IDropItem[] = [
  {
    address: '0xb421d2889081a1',
    link: '/',
    status: 'live',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vitae aliquet eu.',
    thumbnail: 'carousel-card1.jpg',
    title: 'AvengersR00t 1',
    user: 'Username',
    verified: true,
  },
  {
    address: '0xb421d2889081a2',
    link: '/',
    status: 'live',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vitae aliquet eu.',
    thumbnail: 'carousel-card2.jpg',
    title: '🦋 Butterflies 2',
    user: 'Username',
  },
  {
    address: '0xb421d2889081a3',
    link: '/',
    status: 'live',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vitae aliquet eu.',
    thumbnail: 'carousel-card3.jpg',
    title: 'Lonely TERRASSE 3',
    user: 'Username',
  },
  {
    address: '0xb421d2889081a4',
    link: '/',
    status: 'live',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vitae aliquet eu.',
    thumbnail: 'carousel-card4.jpg',
    title: 'Clay figures 4',
    user: 'Username',
  },
  {
    address: '0xb421d2889081a5',
    link: '/',
    status: 'live',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vitae aliquet eu.',
    thumbnail: 'carousel-card5.jpg',
    title: 'AvengersR00t 5',
    user: 'Username',
  },
  {
    address: '0xb421d2889081a6',
    link: '/',
    status: 'live',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vitae aliquet eu.',
    thumbnail: 'carousel-card5.jpg',
    title: 'AvengersR00t 5',
    user: 'Username',
  },
];

const HottestDrops = () => {
  const [show, setShow] = useState<number>(1);
  const [cards, setCards] = useState<IDropItem[]>(data);

  useEffect(() => {
    let tmr: NodeJS.Timer;
    tmr = setInterval(() => {
      if (cards?.length > 0) {
        setCards((prev) => {
          const [firstCard, ...rest] = prev;
          return [...rest, firstCard];
        });
      }
    }, 3000);

    return () => {
      clearInterval(tmr);
    };
  }, []);

  return (
    <section tw="w-full pt-[60px] md:pt-[200px] overflow-hidden">
      <h2 tw="px-4 pb-[30px] md:pb-[104px] text-[24px] md:text-[50px] font-semibold leading-[120%] text-left md:text-center text-dark dark:text-light/90">
        Hottest drops.
      </h2>
      <MultiCarousel
        breakpoints={[
          { 1400: 6 },
          { 1200: 5 },
          { 992: 4 },
          { 768: 3 },
          { 600: 2 },
          { 0: 1 },
        ]}
        disableAnimation={true}
        setCurrent={0}
        setShow={setShow}
        show={4}
      >
        {cards.map((item: IDropItem, index: number) =>
          item.dummy ? (
            <div key={`dummy-${index}`} />
          ) : (
            <div
              key={`${item.address}`}
              className="collection-card-carousel-item"
              css={{
                filter:
                  show > 2 && (index === 0 || index === show - 1)
                    ? 'brightness(50%)'
                    : 'none',
                left: `calc(${index} * (100% / ${show}))`,
                transform:
                  show > 2 && (index === 0 || index === show - 1)
                    ? 'scale(0.9)'
                    : 'none',
                transformOrigin:
                  show > 2 && (index === 0 || index === show - 1)
                    ? 'center center'
                    : index === 0
                    ? 'center right'
                    : 'center left',
                width: `calc(100% / ${show})`,
                zIndex: index === show - 1 ? 10 : 20,
              }}
              id={`${item.address}`}
              tw="absolute px-2.5 top-0 transition-all duration-300"
            >
              <div
                className="group"
                css={{
                  backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.179474) 29.92%, rgba(0, 0, 0, 0) 100%), url(/images/${item.thumbnail})`,
                }}
                tw="relative pt-[148.01%] bg-cover bg-center overflow-hidden rounded-[32px]"
              >
                <div tw="absolute px-3 md:px-3.5 py-[7px] left-7 md:left-8 top-7 md:top-8 h-[30px] md:h-[35px] flex items-center gap-[7px] md:gap-2 bg-[#00000001] border-2 border-white rounded-3xl select-none">
                  <span tw="font-medium text-xs md:text-sm text-light/90 capitalize">
                    {item.status}
                  </span>
                  <span tw="w-[5.24px] md:w-1.5 h-[5.24px] md:h-1.5 bg-[#DD3939] rounded-full" />
                </div>
                <div tw="px-7 md:px-8 py-[21px] absolute left-0 bottom-0 w-full backdrop-blur-md">
                  <div tw="flex items-center gap-3 select-none">
                    <span tw="text-sm text-[#C5C5C5]">
                      by [{item.user}] (
                      {item.address
                        .substring(0, 8)
                        .toUpperCase()
                        .replace('0X', '0x')}
                      ...)
                    </span>
                    {item.verified && (
                      <img
                        alt="check"
                        src={iconVerified}
                        title="Verified"
                        tw="cursor-default"
                      />
                    )}
                  </div>
                  <h3 tw="pt-[1.5px] md:pt-1.5 text-xl md:text-2xl font-semibold tracking-tight leading-[150%] select-none text-light/90">
                    {item.title}
                  </h3>
                  <p tw="pt-3 font-normal text-base md:text-lg tracking-tight leading-[150%] text-[#F3F3F3] select-none">
                    {item.text}
                  </p>
                </div>
                {/* <div
                tabIndex={0}
                tw="hidden group-hover:flex absolute left-0 bottom-0 w-full h-full p-4 flex-col justify-center items-center bg-[#111c]"
              >
                <h3 tw="font-semibold text-2xl text-center text-light/90 select-none">
                  {item.title}
                </h3>
                <Link
                  to={item.link}
                  tw="px-4 py-2 font-semibold text-base text-light/90 bg-[#fa2e59] rounded-lg select-none"
                >
                  <p tw="text-base text-light/90 select-none">{item.text}</p>
                </Link>
              </div> */}
              </div>
            </div>
          )
        )}
      </MultiCarousel>
    </section>
  );
};

export default HottestDrops;
