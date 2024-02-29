import 'twin.macro';

import { useEffect, useState } from 'react';

import { Generic } from '../api/api';
import { alertError, alertSuccess } from '../utils/toast';
import { getIcon } from './ColoredIcon';
import {
  StyledButtonCaption,
  StyledFileDropZone,
  StyledUploadButton,
} from './lib/StyledComponents';

const FileDropZone = (props: {
  id: string;
  default?: string;
  rounded?: boolean;
  setUploadedFileUrl: (value: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [fileType, setFileType] = useState<string>('');

  useEffect(() => {
    if (file) {
      setIsLoading(true);
      const data = new FormData();
      data.append('assets', file, file.name);
      // console.log(file);
      if (file.type) {
        setFileType(file.type);
      }
      if (file.size) {
        setFileSize(file.size || 1);
      }
      Generic.upload(data, (value: number) => {
        setProgress(value);
      })
        .then((res) => {
          if (res && res.status === 200 && res.data?.files?.length > 0) {
            setUploadedUrl(res.data.files[0]);
            props.setUploadedFileUrl(res.data.files[0]);
            alertSuccess('Uploaded successfully!');
          }
        })
        .catch((e) => {
          console.error(e);
          if (e.response?.data) {
            alertError(
              `${e.response.data.statusCode ?? e.response.data.status}: ${
                e.response.data.message ?? e.response.data.error
              }`
            );
          } else {
            alertError('File uploading failed!');
          }
        })
        .finally(() => setIsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // at least one file has been dropped so do something
      // handleFiles(e.dataTransfer.files);
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <StyledFileDropZone
      className="group"
      css={{
        backgroundColor: dragActive
          ? 'rgba(49, 105, 250, 0.5)'
          : 'rgba(49, 105, 250, 0.1)',
        backgroundImage: fileType.startsWith('video')
          ? 'none'
          : `url(${uploadedUrl ?? props.default})`,
        borderRadius: props.rounded ? '100%' : '18px',
      }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {fileType.startsWith('video') && uploadedUrl && (
        <video
          autoPlay
          loop
          muted
          playsInline
          tw="absolute left-0 top-0 w-full h-full object-cover z-10"
        >
          <source src={uploadedUrl} type={fileType} />
        </video>
      )}
      <input
        // accept="image/*"
        id={props.id}
        tw="hidden"
        type="file"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
          }
        }}
      />
      {isLoading ? (
        <div tw="relative w-full max-w-[146px] h-[40px] bg-white rounded-[100px] overflow-hidden">
          <div
            css={{ width: `${(100 * progress) / fileSize}%` }}
            tw="absolute left-0 top-0 h-full bg-[#3169FA] z-20"
          />
          <span tw="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] font-semibold text-[16px] tracking-tight text-[#c1c1c1] z-30">
            Uploading...
          </span>
        </div>
      ) : (
        <>
          {dragActive ? (
            <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark">
              Accept a file
            </div>
          ) : (
            <StyledUploadButton
              css={{ opacity: uploadedUrl || props.default ? 0.01 : 1 }}
              htmlFor={props.id}
            >
              <StyledButtonCaption>Upload</StyledButtonCaption>
              {getIcon('upload', '#fff')}
            </StyledUploadButton>
          )}
        </>
      )}
    </StyledFileDropZone>
  );
};

export default FileDropZone;
