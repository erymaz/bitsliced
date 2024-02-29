import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import { UserContext } from '../contexts/UserContext';
import { getIcon } from './ColoredIcon';
import { socialLink } from './Header';

const mobileMenuItems = [
  {
    icon: 'explore',
    key: 'explore',
    label: 'Explore',
    link: '/explore',
    subitems: [
      {
        key: 'explore-items',
        label: 'Items',
        link: '/explore?tab=items',
      },
      {
        key: 'explore-collections',
        label: 'Collections',
        link: '/explore?tab=collections',
      },
      {
        key: 'explore-tradable',
        label: 'Channel Tickets',
        link: '/explore?tab=tradable',
      },
      {
        key: 'explore-activities',
        label: 'Activities',
        link: '/explore?tab=activities',
      },
    ],
  },
  {
    icon: 'channel',
    key: 'channels',
    label: 'Channels',
    link: '/channels',
    subitems: [
      {
        key: 'channels-explore',
        label: 'Explore',
        link: '/channels?tab=explore',
      },
      {
        key: 'channels-joined',
        label: 'Joined Channels',
        link: '/channels?tab=joined',
      },
      {
        key: 'channels-created',
        label: 'Created Channels',
        link: '/channels?tab=created',
      },
      {
        key: 'channels-tradable',
        label: 'Channel Tickets',
        link: '/channels?tab=tradable',
      },
    ],
  },
  {
    icon: 'slices',
    key: 'slicedNft',
    label: 'Sliced NFT',
    link: '/sliced-nft',
  },
  {
    icon: 'earn',
    key: 'earn',
    label: 'Earn',
    link: '/earn',
    subitems: [
      {
        key: 'earn-total-cashback',
        label: 'Total Cashback',
        link: '/earn?tab=total-cashback',
      },
      {
        key: 'earn-cashback-by-trading',
        label: 'Cashback by trading',
        link: '/earn?tab=cashback-by-trading',
      },
      {
        key: 'earn-cashback-by-joining',
        label: 'Cashback by joining Channels',
        link: '/earn?tab=cashback-by-joining',
      },
    ],
  },
  {
    icon: 'create',
    key: 'create',
    label: 'Create',
    link: '/create',
    subitems: [
      {
        key: 'create-channel',
        label: 'Create a Channel',
        link: '/create/mint-channel',
      },
      {
        key: 'create-nft',
        label: 'Create an NFT',
        link: '/create/mint-nft',
      },
      {
        key: 'create-collection',
        label: 'Create a Collection',
        link: '/create/create-collection',
      },
    ],
  },
  {
    key: 'help',
    label: 'Help',
    link: '/help',
  },
];

const StyledMenuPanel = styled.div`
  ${tw`relative top-16 left-0 w-full h-[calc(100% - 64px)] bg-light dark:bg-dark overflow-auto`}
  animation: slideDown 0.5s ease-out;

  @keyframes slideDown {
    from {
      top: -100%;
    }

    to {
      opacity: 1;
      top: 64px;
    }
  }
`;

const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const { authData, darkMode, logout } = useContext(UserContext);

  const [expandedMenu, setExpandedMenu] = useState<string>('');

  return (
    <div tw="fixed left-0 top-0 w-full h-full z-30" onClick={() => onClose()}>
      <StyledMenuPanel
        className="no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <ul tw="min-h-[calc(100vh - 64px - 150px)]">
          {mobileMenuItems.map((item) => (
            <>
              <li
                key={item.key}
                tw="border-t border-dark/10 dark:border-light/10"
              >
                <Link
                  to={item.link}
                  tw="pl-[18px] h-[64px] w-full flex justify-between items-center"
                  onClick={() => onClose()}
                >
                  <div tw="flex items-center gap-2.5 text-base tracking-tight leading-[150%] text-gray-500 ">
                    {item.icon &&
                      getIcon(item.icon, darkMode ? '#fff8' : '#0008')}
                    {item.label}
                  </div>
                  {
                    item.subitems ? (
                      <button
                        css={{
                          transform:
                            expandedMenu === item.key
                              ? 'rotate(180deg)'
                              : 'rotate(270deg)',
                        }}
                        tw="px-[18px] h-[62px]"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (expandedMenu === item.key) {
                            setExpandedMenu('');
                          } else {
                            setExpandedMenu(item.key);
                          }
                        }}
                      >
                        {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                      </button>
                    ) : null
                    // <div tw="pb-[36px] -rotate-90">
                    //   {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                    // </div>
                  }
                </Link>
              </li>
              {expandedMenu === item.key &&
                item.subitems?.map((subitem) => (
                  <li
                    key={subitem.key}
                    tw="border-t border-dark/10 dark:border-light/10"
                  >
                    <Link
                      to={subitem.link}
                      tw="px-[32px] h-[64px] w-full flex justify-between items-center"
                      onClick={() => onClose()}
                    >
                      <div tw="flex items-center gap-2.5 text-base tracking-tight leading-[150%] text-gray-500">
                        {subitem.label}
                      </div>
                      <div tw="-rotate-90">
                        {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                      </div>
                    </Link>
                  </li>
                ))}
            </>
          ))}
          {authData ? (
            <>
              <li tw="border-t border-dark/10 dark:border-light/10">
                <Link
                  to={`/profile/${authData?.user?.userId}`}
                  tw="px-[18px] h-[64px] w-full flex justify-between items-center"
                  onClick={() => onClose()}
                >
                  <div tw="flex items-center gap-2.5 text-base tracking-tight leading-[150%] text-gray-500">
                    {getIcon('profile', darkMode ? '#fff8' : '#0008')}
                    Profile
                  </div>
                </Link>
              </li>
              <li tw="border-t border-dark/10 dark:border-light/10">
                <button
                  tw="px-[18px] h-[64px] w-full flex justify-between items-center"
                  onClick={() => {
                    logout();
                    navigate('/');
                    onClose();
                  }}
                >
                  <div tw="flex items-center gap-2.5 text-base tracking-tight leading-[150%] text-gray-500">
                    {getIcon('disconnect', darkMode ? '#fff8' : '#0008')}
                    Log out
                  </div>
                </button>
              </li>
            </>
          ) : (
            <div tw="px-4 py-6">
              <Link
                to="/join"
                tw="h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light duration-300 text-light dark:text-dark px-3.5"
                onClick={() => onClose()}
              >
                Create account
              </Link>
            </div>
          )}
        </ul>
        {/* <ul tw="w-full p-4 flex justify-center items-center gap-4 xs:gap-6 sm:gap-10 md:gap-10 border-t border-[rgba(0, 0, 0, 0.15)] dark:border-[rgba(255, 255, 255, 0.15)]">
          {socialLink.map((item) => (
            <li
              key={item.title}
              title={item.title}
              tw="w-7 h-7 hover:opacity-75"
            >
              <a
                href={item.link}
                rel="noreferrer"
                target="_blank"
                tw="w-full h-full flex justify-center items-center"
              >
                {getIcon(item.icon, darkMode ? '#fff' : '#000')}
              </a>
            </li>
          ))}
        </ul> */}
      </StyledMenuPanel>
    </div>
  );
};

export default MobileMenu;
