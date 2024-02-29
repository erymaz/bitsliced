import { toast } from 'react-toastify';

import ErrorIcon from '../assets/images/tx-error.png';
import SuccessIcon from '../assets/images/tx-success.png';

export const alertSuccess = (msg: string) => {
  toast.success(
    <div>
      <p>Success</p>
      <p className="Toastify__toast-submsg">{msg}</p>
    </div>,
    {
      hideProgressBar: true,
      icon: () => <img alt="" src={SuccessIcon} />,
      position: toast.POSITION.BOTTOM_CENTER,
    }
  );
};

export const alertError = (msg: string) => {
  toast.error(
    <div>
      <p>Error</p>
      <p className="Toastify__toast-submsg">{msg}</p>
    </div>,
    {
      hideProgressBar: true,
      icon: () => <img alt="" src={ErrorIcon} />,
      position: toast.POSITION.BOTTOM_CENTER,
    }
  );
};

export const alertInfo = (msg: string) => {
  toast.info(
    <div>
      <p className="Toastify__toast-submsg">{msg}</p>
    </div>,
    {
      hideProgressBar: true,
      icon: () => <img alt="" src={SuccessIcon} />,
      position: toast.POSITION.BOTTOM_CENTER,
    }
  );
};

export const alertWarning = (msg: string) => {
  toast.warn(
    <div>
      <p className="Toastify__toast-submsg">{msg}</p>
    </div>,
    {
      hideProgressBar: true,
      icon: () => <img alt="" src={ErrorIcon} />,
      position: toast.POSITION.BOTTOM_CENTER,
    }
  );
};
