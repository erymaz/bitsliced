import 'twin.macro';

import { useContext } from 'react';

import { UserContext } from '../contexts/UserContext';
import { getIcon } from './ColoredIcon';

const BackLink = (props: { handleBack: () => void }) => {
  const { darkMode } = useContext(UserContext);

  return (
    <button tw="flex items-center hover:opacity-75" onClick={props.handleBack}>
      <div tw="rotate-90 scale-90">
        {getIcon('dropdown', darkMode ? '#fff' : '#000')}
      </div>
      <span tw="font-medium text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
        Back
      </span>
    </button>
  );
};

export default BackLink;
