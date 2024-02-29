import { ReactNode, useContext, useEffect, useState } from 'react';
import tw, { styled } from 'twin.macro';

import { UserContext } from '../../contexts/UserContext';
import { getMimeType } from '../../utils';
import { getIcon } from '../ColoredIcon';
import Dropdown from '../Dropdown';

export const StyledPageTitle = styled.h2`
  ${tw`font-semibold text-[40px] tracking-tight leading-[150%] text-center text-[#2F2F2F] dark:text-[#c1c1c1]`}
`;

export const StyledCard = styled.div`
  ${tw`p-3.5 bg-white dark:bg-light/5 rounded-md`}
`;

export const StyledCardTitle = styled.h3`
  ${tw`pb-1 font-semibold text-base tracking-tight leading-[150%] text-black dark:text-light/90`}
`;

export const StyledCardSubtitle = styled.h3`
  ${tw`pt-1.5 pb-1 text-[14px] tracking-tight leading-[150%] text-gray-500 `}
`;

export const StyledFileDropZone = styled.div`
  ${tw`relative mt-1.5 h-[200px] flex justify-center items-center self-stretch w-full bg-no-repeat bg-center bg-cover border-2 border-dashed border-hero-purpledark dark:border-hero-bluelight overflow-hidden`}
`;

export const StyledUploadButton = styled.label`
  ${tw`px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark text-light dark:invert relative duration-300 cursor-pointer z-10`}
`;

export const StyledButtonCaption = styled.span`
  ${tw`font-medium text-base tracking-tight leading-[150%] `}
`;

export const StyledInput = styled.input`
  ${tw`px-2.5 h-[46px] flex items-center w-full text-base tracking-tight leading-[150%] text-black dark:text-light/90 bg-[rgba(245, 245, 247, 0.5)] dark:bg-light/5 border border-[rgba(0, 0, 0, 0.15)] rounded-[7px]`}
`;

export const StyledTextArea = styled.textarea`
  ${tw`px-2.5 py-2.5 min-h-[102px] flex items-center w-full text-base tracking-tight leading-[150%] text-black dark:text-light/90 bg-[rgba(245, 245, 247, 0.5)] dark:bg-light/5 border border-[rgba(0, 0, 0, 0.15)] rounded-[7px]`}
`;

export const StyledButton = styled.button(
  ({
    bold,
    outlined,
    unselected,
    wide,
  }: {
    bold?: boolean;
    outlined?: boolean;
    unselected?: boolean;
    wide?: boolean;
  }) => [
    tw`h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light duration-300 text-light dark:text-dark`,
    bold ? tw`font-semibold` : tw`font-medium`,
    outlined ? tw`` : tw``,
    unselected ? tw`opacity-40` : tw`opacity-100`,
    wide ? tw`px-6` : tw`px-3.5`,
  ]
);

export const StyledLink = styled.a(
  ({
    bold,
    outlined,
    wide,
  }: {
    bold?: boolean;
    outlined?: boolean;
    wide?: boolean;
  }) => [
    tw`h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light duration-300 text-light dark:text-dark`,
    bold ? tw`font-semibold` : tw`font-medium`,
    wide ? tw`px-6` : tw`px-3.5`,
    outlined
      ? tw`text-dark dark:text-light bg-transparent`
      : tw`text-light/90 dark:text-dark bg-[#3169FA]`,
  ]
);

export const TextLine = ({
  label,
  text,
  title,
}: {
  label: string | ReactNode;
  text: string | ReactNode;
  title?: string;
}) => {
  return (
    <div tw="w-full flex justify-between items-center">
      <span tw="text-base tracking-tight leading-[150%] text-left text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
        {label}
      </span>
      <span
        title={title}
        tw="font-bold text-base tracking-tight leading-[150%] text-right text-black dark:text-light/90"
      >
        {text}
      </span>
    </div>
  );
};

export const FilterLineWidget = (props: {
  filter?: {
    show: boolean;
    toggle: () => void;
  };
  search?: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  };
  viewStyle?: {
    options: string[];
    value: string;
    onChange: (value: string) => void;
  };
  sortOption?: {
    noLabel?: boolean;
    options: string[];
    value: string;
    onChange: (value: string) => void;
  };
  count?: number;
  countLabel: string;
  refreshMeta?: boolean;
}) => {
  const { darkMode } = useContext(UserContext);

  return (
    <div tw="w-full flex justify-between items-center flex-wrap gap-3 md:gap-4">
      <div tw="w-full md:w-auto flex justify-between items-center gap-3 md:gap-4 flex-wrap">
        <div tw="flex justify-center">
          <div
            tw="px-3.5 flex h-10 justify-center items-center gap-[7px] bg-white dark:bg-white/5 sm:dark:bg-light/10 rounded-lg cursor-pointer"
            onClick={() => props.filter?.toggle()}
          >
            {props.filter?.show ? (
              <div tw="rotate-90">
                {getIcon('dropdown', darkMode ? '#fff' : '#000')}
              </div>
            ) : (
              getIcon('filter', darkMode ? '#fff' : '#000')
            )}
            <span tw="text-base text-black dark:text-light/90">Filters</span>
          </div>
        </div>
        {props.viewStyle && (
          <div tw="hidden md:flex px-3.5 h-10 justify-center items-center gap-2.5 bg-white dark:bg-white/5 rounded-lg">
            {props.viewStyle.options.map((item) => (
              <div
                key={item}
                css={{ opacity: props.viewStyle?.value !== item ? 0.3 : 1 }}
                tw="cursor-pointer"
                onClick={() => props.viewStyle?.onChange(item)}
              >
                {getIcon(item, darkMode ? '#fff' : '#000')}
              </div>
            ))}
          </div>
        )}
        {props.search && (
          <div tw="w-full md:w-auto order-3 md:order-none px-3.5 flex h-10 items-center gap-2.5 bg-white dark:bg-white/5 rounded-lg">
            {getIcon('search', darkMode ? '#fff' : '#0008')}
            <input
              placeholder={props.search.label ?? 'Search'}
              tw="w-full text-base tracking-tight text-black dark:text-light/90 bg-transparent outline-none"
              type="search"
              value={props.search.value}
              onChange={(e) => props.search?.onChange(e.target.value)}
            />
          </div>
        )}
        {props.sortOption && (
          <div tw="order-2 md:order-none flex items-center gap-[5px] cursor-pointer">
            {!props.sortOption.noLabel && (
              <span tw="text-base tracking-tight text-black dark:text-light/90">
                Sort by
              </span>
            )}
            <Dropdown
              color="#6B7280"
              defaultValue={
                props.sortOption.value ?? props.sortOption.options[0]
              }
              options={props.sortOption.options}
              value={props.sortOption.value}
              onChange={props.sortOption.onChange}
            />
          </div>
        )}
      </div>
      <div tw="hidden md:flex justify-center items-center gap-6 flex-wrap">
        <span tw="font-medium text-sm md:text-base tracking-tight text-black dark:text-light/90">
          {props.count ?? 0} {props.countLabel ?? 'items'}
        </span>
        {props.refreshMeta && (
          <button tw="px-[14px] flex h-10 items-center gap-[7px] bg-white dark:bg-white/5 rounded-3xl">
            {getIcon('reload', darkMode ? '#fff' : '#000')}
            <span tw="text-base tracking-tight text-black dark:text-light/90">
              Refresh metadata
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export const ImageSection = (props: {
  mimeType?: string;
  imagePath?: string;
}) => {
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    if (!props.mimeType && props.imagePath && props.imagePath.length > 0) {
      setMimeType(getMimeType(props.imagePath));
    }
  }, [props]);

  return (
    <>
      {(props.mimeType ?? mimeType).startsWith('video') ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          tw="absolute left-0 top-0 w-full h-full object-contain z-10"
        >
          <source src={props.imagePath} type={props.mimeType ?? mimeType} />
        </video>
      ) : (
        <picture tw="absolute left-0 top-0 w-full h-full backdrop-blur-xl rounded-lg z-10">
          <source
            srcSet={props.imagePath}
            tw="w-full h-full object-contain object-center"
            type="image/avif"
          />
          <source
            srcSet={props.imagePath}
            tw="w-full h-full object-contain object-center"
            type="image/webp"
          />
          <img
            alt=""
            src={props.imagePath}
            tw="w-full h-full object-contain object-center"
          />
        </picture>
      )}
    </>
  );
};

export const ImageSectionAutoSize = (props: {
  mimeType?: string;
  imagePath?: string;
}) => {
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    if (!props.mimeType && props.imagePath && props.imagePath.length > 0) {
      setMimeType(getMimeType(props.imagePath));
    }
  }, [props]);

  return (
    <>
      {(props.mimeType ?? mimeType).startsWith('video') ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          tw="mx-auto w-auto max-w-full h-auto object-contain z-10"
        >
          <source src={props.imagePath} type={props.mimeType ?? mimeType} />
        </video>
      ) : (
        <picture tw="mx-auto w-auto max-w-full h-auto backdrop-blur-xl rounded-lg z-10">
          <source
            srcSet={props.imagePath}
            tw="mx-auto w-auto max-w-full h-auto object-contain object-center"
            type="image/avif"
          />
          <source
            srcSet={props.imagePath}
            tw="mx-auto w-auto max-w-full h-auto object-contain object-center"
            type="image/webp"
          />
          <img
            alt=""
            src={props.imagePath}
            tw="mx-auto w-auto max-w-full h-auto object-contain object-center"
          />
        </picture>
      )}
    </>
  );
};

export const Avatar = ({ pic, size }: { pic?: string; size: number }) => {
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    setMimeType(getMimeType(pic));
  }, [pic]);

  return (
    <div
      css={{
        backgroundImage: mimeType.startsWith('video') ? 'none' : `url(${pic})`,
        height: size,
        minWidth: size,
        width: size,
      }}
      tw="relative bg-white bg-no-repeat bg-center bg-cover rounded-full overflow-hidden"
    >
      {mimeType.startsWith('video') ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          tw="absolute left-0 top-0 w-full h-full object-contain backdrop-blur-sm z-10"
        >
          <source src={pic} type={mimeType} />
        </video>
      ) : (
        <picture tw="absolute left-0 top-0 w-full h-full backdrop-blur-2xl z-10 rounded-full">
          <source
            srcSet={pic}
            tw="w-full h-full object-contain object-center"
            type="image/avif"
          />
          <source
            srcSet={pic}
            tw="w-full h-full object-contain object-center"
            type="image/webp"
          />
          <img
            alt=""
            src={pic}
            tw="w-full h-full object-contain object-center"
          />
        </picture>
      )}
    </div>
  );
};

export const AccrodionPanel = (props: {
  title: string;
  children: ReactNode;
  darkMode?: boolean;
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <div tw="border-t-2 border-[rgba(0, 0, 0, 0.1)] dark:border-[rgba(255,255,255,0.1)]">
      <div
        tw="py-3.5 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span tw="font-semibold text-base tracking-tight text-dark dark:text-light/90">
          {props.title}
        </span>
        <div css={expanded ? { transform: 'rotate(180deg)' } : {}}>
          {getIcon('dropdown', props.darkMode ? '#fff' : '#000')}
        </div>
      </div>
      {expanded && props.children}
    </div>
  );
};
