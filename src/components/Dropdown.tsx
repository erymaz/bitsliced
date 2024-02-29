import 'twin.macro';

import { useContext, useState } from 'react';

import { UserContext } from '../contexts/UserContext';
import { getIcon } from './ColoredIcon';

const Dropdown = (props: {
  defaultValue: string;
  value: string;
  options: string[];
  color?: string;
  bold?: boolean;
  onChange: (value: string) => void;
}) => {
  const { darkMode } = useContext(UserContext);

  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);

  return (
    <div
      tw="sm:px-2 relative flex items-center gap-2 cursor-pointer max-w-[200px] sm:max-w-none"
      onClick={() => setShowSortDropdown(!showSortDropdown)}
    >
      <span
        css={{
          color: props.color ?? (darkMode ? '#fff' : '#000'),
          fontWeight: props.bold ? 500 : 400,
        }}
        tw="text-sm md:text-base tracking-tight capitalize truncate"
      >
        {props.value}
      </span>
      {getIcon('dropdown', darkMode ? '#fff' : '#000')}
      {showSortDropdown && (
        <>
          <div onClick={() => setShowSortDropdown(false)} />
          <ul
            className="dropdown-list"
            tw="absolute w-auto max-h-64 left-0 top-10 bg-light/90 dark:bg-dark/90 backdrop-blur-md border-[1px] border-dark/10 dark:border-light/10 shadow-lg overflow-auto rounded-lg z-30"
          >
            {props.options.map((item) => (
              <li
                key={item}
                css={{
                  fontWeight: props.value === item ? 700 : 400,
                }}
                tw="px-6 w-auto h-12 flex justify-center items-center text-sm tracking-tight capitalize whitespace-nowrap text-dark dark:text-light/90 hover:bg-[#0001] dark:hover:bg-[#fff1] border-b border-dark/5 dark:border-light/5"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  props.onChange(item);
                  setShowSortDropdown(false);
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Dropdown;
