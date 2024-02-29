import './Spinner.css';

import React from 'react';

import { getIcon } from './ColoredIcon';

const Spinner = (props: { open: boolean }) => {
  return props.open ? (
    <div
      style={{
        alignItems: 'center',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        left: 0,
        position: 'fixed',
        top: 0,
        transform: 'scale(3)',
        width: '100%',
        zIndex: 2000,
      }}
    >
      <div className="spinning">{getIcon('loading', '#3169FA')}</div>
      {/* <div className="lds-facebook">
        <div></div>
        <div></div>
        <div></div>
      </div> */}
    </div>
  ) : null;
};

export default Spinner;
