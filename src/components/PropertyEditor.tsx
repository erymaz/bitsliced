import 'twin.macro';

import React, { useContext, useEffect, useState } from 'react';

import { UserContext } from '../contexts/UserContext';
import { defaultProperty, Property } from '../type.d';
import { getIcon } from './ColoredIcon';
import { StyledButton, StyledInput } from './lib/StyledComponents';

const PropertyEditor = (props: {
  default?: Property[];
  onChange: (properties: Property[]) => void;
}) => {
  const { darkMode } = useContext(UserContext);

  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (props.default) {
      setProperties(props.default);
    }
  }, [props.default]);

  useEffect(() => {
    props.onChange(
      properties.filter(
        (item) =>
          item.trait_type.trim().length > 0 && item.value.trim().length > 0
      )
    );
  }, [properties]);

  const setPropertyValue = ({
    index,
    trait_type,
    value,
  }: {
    index: number;
    trait_type?: string;
    value?: string;
  }) => {
    if (index < properties.length) {
      setProperties((prev) => {
        const tmpArr = [...prev];
        if (trait_type) {
          tmpArr[index] = {
            ...tmpArr[index],
            trait_type,
          };
        }
        if (value) {
          tmpArr[index] = {
            ...tmpArr[index],
            value,
          };
        }
        return tmpArr;
      });
    }
  };

  return (
    <>
      <div css={{ gridTemplateColumns: '46px 1fr 1fr' }} tw="grid gap-3.5">
        {properties.length > 0 && (
          <>
            <div />
            <div tw="pt-3.5 font-bold text-sm tracking-tight leading-[150%] text-dark dark:text-light/90">
              Type
            </div>
            <div tw="pt-3.5 font-bold text-sm tracking-tight leading-[150%] text-dark dark:text-light/90">
              Name
            </div>
          </>
        )}
        {properties.map((item, index) => (
          <>
            <div
              tw="w-[46px] h-[46px] flex justify-center items-center border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff1] rounded-[7px] cursor-pointer"
              onClick={() => {
                setProperties(
                  properties.filter((item: Property, i: number) => i !== index)
                );
              }}
            >
              <div tw="rotate-45">
                {getIcon('add', darkMode ? '#fff8' : '#000')}
              </div>
            </div>
            <StyledInput
              value={item.trait_type}
              onChange={(e) =>
                setPropertyValue({
                  index,
                  trait_type: e.target.value,
                })
              }
            />
            <StyledInput
              value={item.value}
              onChange={(e) =>
                setPropertyValue({
                  index,
                  value: e.target.value,
                })
              }
            />
          </>
        ))}
      </div>
      <div tw="pt-3.5">
        <StyledButton
          onClick={() => {
            setProperties((prev) => [...prev, defaultProperty]);
          }}
        >
          <span>Add property</span>
          {getIcon('add', darkMode ? '#000' : '#fff')}
        </StyledButton>
      </div>
    </>
  );
};

export default PropertyEditor;
