import 'twin.macro';

import { useContext } from 'react';
import { Link } from 'react-router-dom';

import imgLogoDark from '../assets/svgs/logo-dark.svg';
import imgLogoLight from '../assets/svgs/logo-light.svg';
import { UserContext } from '../contexts/UserContext';
import { getIcon } from './ColoredIcon';
import { socialLink } from './Header';

const pageLinks = [
  { link: '/contact-us', title: 'Contact Us' },
  { link: '/docs', title: 'Docs' },
  { link: '/audit-reports', title: 'Audit Reports' },
  { link: '/brand', title: 'Brand' },
  { link: '/Terms', title: 'Terms' },
];

const Footer = () => {
  const { darkMode } = useContext(UserContext);

  return (
    <footer tw="p-4 lg:p-8 w-full grid lg:grid-cols-2 bg-light dark:bg-dark border-t border-dark/10 dark:border-light/5">
      <div tw="place-self-center lg:place-self-start space-y-4">
        <a href="#top" tw="block pb-4 lg:pb-0">
          <img
            alt="logo"
            src={darkMode ? imgLogoDark : imgLogoLight}
            tw="max-w-[108px] md:max-w-[153px]"
          />
        </a>

        <p
          css={{ textOverflow: 'ellipsis' }}
          tw="hidden lg:block text-sm text-dark dark:text-light/90 whitespace-nowrap overflow-hidden"
        >
          Copyright &copy; {new Date().getFullYear()} Bitsliced LLC (GmbH). All
          rights reserved.
        </p>
      </div>
      <div tw="place-self-center lg:place-self-end space-y-4">
        <ul tw="flex gap-4 justify-center lg:justify-end">
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
        </ul>
        <div tw="flex justify-center md:justify-start gap-3 sm:gap-5 flex-wrap">
          {pageLinks.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              tw="text-sm text-dark dark:text-light/90 hover:opacity-75"
            >
              {item.title}
            </Link>
          ))}
        </div>
        <p tw="block lg:hidden text-xs tracking-tight text-gray-500">
          Copyright &copy; {new Date().getFullYear()} Bitsliced LLC (GmbH). All
          rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
