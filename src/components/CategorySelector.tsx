import 'twin.macro';

import { useContext, useEffect, useState } from 'react';

import { UserContext } from '../contexts/UserContext';

const CategorySelector = (props: {
  limit?: number;
  default?: string[];
  options: string[];
  onChange: (categories: string[]) => void;
}) => {
  const { darkMode } = useContext(UserContext);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    props.default ?? []
  );

  useEffect(() => {
    if (props.default) {
      setSelectedCategories(props.default);
    }
  }, [props.default]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      const modified = selectedCategories.filter((item) => item !== cat);
      setSelectedCategories(modified);
      props.onChange(modified);
    } else {
      if (selectedCategories.length < (props.limit ?? Infinity)) {
        const modified = [...selectedCategories, cat];
        setSelectedCategories(modified);
        props.onChange(modified);
      }
    }
  };

  return (
    <ul tw="flex gap-x-3.5 gap-y-2.5 flex-wrap">
      {props.options.map((item: string) => (
        <li
          key={item}
          css={
            selectedCategories.includes(item)
              ? {
                  backgroundColor: darkMode ? '#fff2' : '#EBF0FF',
                  borderColor: darkMode ? '#fff' : '#000',
                  color: darkMode ? '#fff' : '#000',
                }
              : {
                  backgroundColor: darkMode
                    ? '#fff1'
                    : 'rgba(245, 245, 247, 0.5)',
                  borderColor: 'rgba(0, 0, 0, 0.15)',
                  color: darkMode ? '#fff8' : '#0008',
                }
          }
          tw="px-6 h-[46px] flex justify-center items-center text-base tracking-tight leading-[150%] border cursor-pointer rounded-[7px] duration-300"
          onClick={() => toggleCategory(item)}
        >
          {item}
        </li>
      ))}
    </ul>
  );
};

export default CategorySelector;
