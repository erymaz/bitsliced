import 'twin.macro';

const MenuIcon = (props: { opened: boolean }) => {
  return (
    <div tw="relative w-6 h-6">
      <div
        css={
          props.opened
            ? {
                transform: 'translate(-50%, -50%) rotate(45deg)',
              }
            : {
                transform: 'translate(-50%, calc(-50% + 0.22rem))',
              }
        }
        tw="absolute top-1/2 left-1/2 w-[1.125rem] h-[0.1rem] bg-black dark:bg-white rounded-full transition-all duration-300"
      />
      <div
        css={
          props.opened
            ? {
                transform: 'translate(-50%, -50%) rotate(-45deg)',
              }
            : {
                transform: 'translate(-50%, calc(-50% - 0.22rem))',
              }
        }
        tw="absolute top-1/2 left-1/2 w-[1.125rem] h-[0.1rem] bg-black dark:bg-white rounded-full transition-all duration-300"
      />
    </div>
  );
};

export default MenuIcon;
