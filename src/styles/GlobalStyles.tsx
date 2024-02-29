import { createGlobalStyle } from 'styled-components';
import tw, { GlobalStyles as BaseStyles, theme } from 'twin.macro';

import Fonts from './Fonts';

const CustomStyles = createGlobalStyle`
  html{
    scroll-behavior: smooth;
    ${tw`bg-light`}
  }

  html:has(body.dark){
    ${tw`bg-dark`}
  }
  
  body {
    ${tw`font-system bg-light dark:bg-dark `}
  }

  * {
    box-sizing: border-box;
    font-family: inherit;
    letter-spacing: -0.019em;
    font-size: 17px;
    line-height: 150%;
  }

  h1, h2, h3, h4, h5, h6{
    ${tw`text-dark dark:text-light/90`}
  }

  svg * {
    transition: none;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .Toastify * {
    ${tw``}
  }

  .collection-card-carousel-item {
    transition: all 0.5s ease-out;
  }

  @keyframes risin-up {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0);
    }
  }

  .popup-content {
    animation: risin-up 0.4s ease-out;
  }

  @keyframes dropdown {
    from {
      opacity: 0;
      transform: scaleY(0);
    }

    to {
      opacity: 1;
      transform: scaleY(1);
    }
  }

  .dropdown-list {
    transform-origin: left top;
    animation: dropdown 0.25s ease-out;
  }

  @keyframes slide-left {
    from {
      opacity: 0;
      transform: scaleX(0);
    }

    to {
      opacity: 1;
      transform: scaleX(1);
    }
  }

  .slide-left {
    transform-origin: right top;
    animation: slide-left 0.25s ease-out;
  }

  @keyframes highlight {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.075);
    }
    100% {
      transform: scale(1);
    }
  }

  .hightlight-scaling {
    animation: highlight 1s infinite;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }

  .spinning {
    animation: rotate 1.5s linear infinite;
  }

  .tags-line::-webkit-scrollbar {
    display: none;
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .animate-shimmer {
    animation : shimmer 2s infinite;
    background: linear-gradient(to right, #fff1 4%, #0001 25%, #fff1 36%);
    background-size: 1000px 100%;
  }
`;

const GlobalStyles = () => (
  <>
    <Fonts />
    <BaseStyles />
    <CustomStyles />
  </>
);

export default GlobalStyles;
