import 'twin.macro';

import { useContext, useEffect, useRef, useState } from 'react';

import { UserContext } from '../contexts/UserContext';
import { data as categories } from '../pages/Home/CategoriesSection';

const CategorySelectorLine = (props: {
  selected: string[];
  setSelected: (value: string[]) => void;
}) => {
  const { darkMode } = useContext(UserContext);
  const scrl = useRef<HTMLDivElement>(null);

  const [categoryList, setCategoryList] = useState<string[]>([]);

  useEffect(() => {
    const categoryList = categories.map((item) => item.title);
    setCategoryList(categoryList);
  }, []);

  return (
    <div tw="relative w-auto flex items-center gap-2.5 justify-start flex-nowrap overflow-x-auto">
      <div
        ref={scrl}
        className="tags-line"
        tw="w-full flex items-center gap-2.5 flex-nowrap overflow-x-auto"
      >
        {categoryList.map((item) => (
          <div
            key={item}
            css={
              props.selected.includes(item)
                ? {
                    background: darkMode ? '#f0f0f2' : '#141417',
                    color: darkMode ? '#000' : '#fff',
                  }
                : {
                    background: darkMode ? '#1F1F22' : '#fafaff',
                    color: darkMode ? '#fff' : '#000',
                  }
            }
            id={item}
            tw="px-4 h-8 flex items-center whitespace-nowrap rounded-lg cursor-pointer text-sm"
            onClick={() => {
              if (props.selected.includes(item)) {
                props.setSelected(props.selected.filter((t) => t !== item));
              } else {
                props.setSelected([...props.selected, item]);
              }
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySelectorLine;
