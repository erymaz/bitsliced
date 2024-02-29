import 'twin.macro';

import { useSearchParams } from 'react-router-dom';

import { getIcon } from '../components/ColoredIcon';

const IconTestPage = () => {
  const [queryParams] = useSearchParams();

  return (
    <div tw="my-[240px] scale-[20] flex justify-center items-center bg-[#efa]">
      {getIcon(queryParams.get('key') ?? '', '#f00')}
    </div>
  );
};

export default IconTestPage;
