import 'twin.macro';

import { useContext, useEffect, useState } from 'react';

import { Comment } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import FileDropZone from '../../components/FileDropZone';
import {
  ImageSectionAutoSize,
  StyledButton,
  StyledInput,
} from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import { CommentData } from '../../type.d';
import { shortAddress, validateUrl } from '../../utils';
import { timeAgo } from '../../utils/datetime';
import { alertError } from '../../utils/toast';

const maxLength = 300;

const CommentItem = (props: { data: CommentData }) => {
  const { darkMode, user } = useContext(UserContext);

  const [commentData, setCommentData] = useState<CommentData>(props.data);

  const [isNewVersion, setIsNewVersion] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [media, setMedia] = useState<string>('');

  useEffect(() => {
    if (props.data?.comment_content) {
      try {
        const obj = JSON.parse(props.data?.comment_content);
        setUrl(obj.url ?? '');
        setMedia(obj.media ?? '');
        setComment(obj.comment ?? '');
        setIsNewVersion(true);
      } catch (e) {
        // console.error(e);
      }
    }
  }, [props]);

  return (
    <div
      key={commentData._id}
      tw="mt-3 p-3 rounded-lg border-[1px] border-dark/10 dark:border-light/5"
    >
      <div tw="flex items-center gap-3.5">
        <div
          css={{
            backgroundImage: `url(${
              commentData.commentedBy?.profile_image_url ??
              props.data?.commentedBy?.profile_image_url
            })`,
          }}
          tw="w-[60px] h-[60px] bg-center bg-cover border-2 border-white rounded-full"
        />
        <div>
          <div tw="font-semibold text-lg tracking-tight text-dark dark:text-light/90">
            {commentData.commentedBy?.name ?? props.data?.commentedBy?.name}
          </div>
          <div tw="text-base tracking-tight text-[#2F2F2F] dark:text-[#e1e1e1]">
            (
            {shortAddress(
              commentData.commentedBy?.walletAddress ??
                props.data?.commentedBy?.walletAddress
            )}
            )
          </div>
        </div>
      </div>
      {commentData.createdAt && (
        <p tw="pt-4 pb-0 block text-xs text-dark/50 dark:text-light/50">
          {timeAgo(new Date(commentData.createdAt))}
        </p>
      )}
      {isNewVersion && media && media.length > 0 && (
        <div tw="pt-4">
          <ImageSectionAutoSize imagePath={media} />
        </div>
      )}
      <p tw="py-6 text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)] break-words">
        {isNewVersion ? comment : commentData.comment_content}
      </p>
      {isNewVersion && url && url.trim().length > 0 && (
        <div tw="pb-6 flex items-center gap-2">
          {getIcon('link', darkMode ? '#fff' : '#000')}{' '}
          <a
            href={url}
            rel="noreferrer"
            target="_blank"
            tw="underline text-[17px] text-dark dark:text-light"
          >
            {url}
          </a>
        </div>
      )}
      <div tw="flex items-center gap-2.5 md:gap-4 flex-wrap">
        <button
          tw="px-3.5 h-10 flex items-center gap-[7px] hover:bg-[#0001] rounded-[7px]"
          onClick={() => {
            if (!user) return;
            if (commentData.comment_downvotes?.includes(user?._id)) {
              alertError('To upvote it, cancel downvote please.');
            } else {
              Comment.upvote(commentData._id ?? '', user?._id ?? '')
                .then((res) => {
                  if (res) {
                    setCommentData(res);
                  }
                })
                .catch((e) => {
                  console.error(e);
                  alertError(e.toString());
                });
            }
          }}
        >
          {getIcon(
            'upvote',
            commentData.comment_upvotes?.includes(user?._id)
              ? '#3169FA'
              : darkMode
              ? '#fff'
              : '#000'
          )}
          <span
            css={{
              color: commentData.comment_upvotes?.includes(user?._id)
                ? '#3169FA'
                : darkMode
                ? '#fff'
                : '#000',
            }}
            tw="font-semibold text-base tracking-tight leading-[150%]"
          >
            {commentData.comment_upvotes_count ?? 0}
          </span>
        </button>
        <button
          tw="px-3.5 h-10 flex items-center gap-[7px] hover:bg-[#0001] rounded-[7px]"
          onClick={() => {
            if (!user) return;
            if (commentData.comment_upvotes?.includes(user?._id)) {
              alertError('To downvote it, cancel upvote please.');
            } else {
              Comment.downvote(commentData._id ?? '', user?._id ?? '')
                .then((res) => {
                  if (res) {
                    setCommentData(res);
                  }
                })
                .catch((e) => {
                  console.error(e);
                  alertError(e.toString());
                });
            }
          }}
        >
          {getIcon(
            'downvote',
            commentData.comment_downvotes?.includes(user?._id)
              ? '#3169FA'
              : darkMode
              ? '#fff'
              : '#000'
          )}
          <span
            css={{
              color: commentData.comment_downvotes?.includes(user?._id)
                ? '#3169FA'
                : darkMode
                ? '#fff'
                : '#000',
            }}
            tw="font-semibold text-base tracking-tight leading-[150%]"
          >
            {commentData.comment_downvotes_count ?? 0}
          </span>
        </button>
        <button tw="px-3.5 h-10 flex items-center gap-[7px] hover:bg-[#0001] rounded-[7px]">
          {getIcon('more', darkMode ? '#fff' : '#000')}
          <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            More
          </span>
        </button>
      </div>
    </div>
  );
};

const CommentWidget = (props: {
  postId: string;
  editable?: boolean;
  allowUrl?: boolean;
  allowMedia?: boolean;
  setCommentsCount?: (value: number) => void;
}) => {
  const { darkMode, user } = useContext(UserContext);

  const [comment, setComment] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [media, setMedia] = useState<string>('');
  const [urlCopy, setUrlCopy] = useState<string>('');
  const [validUrl, setValidUrl] = useState<boolean>(true);
  const [mediaCopy, setMediaCopy] = useState<string>('');
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (props.postId) {
      getComments(props.postId);
    }
  }, [props.postId]);

  const getComments = (postId: string) => {
    setLoading(true);
    Comment.getByPostId(postId)
      .then((res: CommentData[]) => {
        if (res) {
          setComments(
            res.sort((a, b) => {
              if (!a.createdAt) {
                return 1;
              } else if (!b.createdAt) {
                return -1;
              } else if (a.createdAt < b.createdAt) {
                return 1;
              } else if (a.createdAt > b.createdAt) {
                return -1;
              } else {
                return 0;
              }
            })
          );
          if (props.setCommentsCount) {
            props.setCommentsCount(res.length);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = () => {
    if (!user || comment.trim().length === 0) return;
    setSaving(true);
    Comment.create({
      channelpost_id: props.postId,
      comment_content: JSON.stringify({
        comment,
        media,
        url,
      }),
      user_id: user?._id ?? '',
    })
      .then((res) => {
        if (res) {
          getComments(props.postId);
          setComment('');
          setUrl('');
          setMedia('');
        }
      })
      .catch((e) => {
        console.error(e);
        alertError(e.toString());
      })
      .finally(() => setSaving(false));
  };

  return (
    <div>
      {showAddPopup && (
        <div tw="fixed left-0 top-0 w-full h-full flex justify-center items-center backdrop-blur z-30">
          <div
            tw="left-0 top-0 w-full h-full"
            onClick={() => setShowAddPopup(false)}
          />
          <div tw="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] p-8 rounded-[17px] bg-[#fff] dark:bg-[#1e1a1c]">
            <h3 tw="font-semibold text-[22px]">Add URL/media to the comment</h3>
            {props.allowUrl && (
              <div tw="pt-4">
                <label htmlFor="url_in_comment" tw="text-dark dark:text-light">
                  URL:
                </label>
                <StyledInput
                  id="url_in_comment"
                  type="url"
                  value={urlCopy}
                  onChange={(e) => {
                    const valid = validateUrl(e.target.value);
                    setValidUrl(valid);
                    setUrlCopy(e.target.value);
                  }}
                />
                {!validUrl && (
                  <div tw="pt-1 text-[12px] text-[#d40]">Invalid URL</div>
                )}
              </div>
            )}
            {props.allowMedia && (
              <div tw="pt-4">
                <div tw="text-dark dark:text-light">Media:</div>
                <FileDropZone
                  default={mediaCopy}
                  id="media_in_comment"
                  setUploadedFileUrl={(url: string) => setMediaCopy(url)}
                />
              </div>
            )}
            <div tw="pt-4 flex justify-end gap-2">
              <StyledButton onClick={() => setShowAddPopup(false)}>
                Cancel
              </StyledButton>
              <StyledButton
                disabled={props.allowUrl && !validUrl}
                onClick={() => {
                  setUrl(urlCopy);
                  setMedia(mediaCopy);
                  setShowAddPopup(false);
                }}
              >
                Add
              </StyledButton>
            </div>
          </div>
        </div>
      )}
      <div tw="bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 rounded-md overflow-hidden">
        {props.editable ? (
          <>
            {media && media.length > 0 && (
              <ImageSectionAutoSize imagePath={media} />
            )}
            <div tw="relative p-3">
              <textarea
                maxLength={maxLength}
                placeholder="What is your thought?"
                tw="w-full min-h-[120px] text-base text-dark dark:text-light/90 bg-transparent outline-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div tw="absolute right-3 bottom-0 text-2xs text-dark/50 dark:text-light/50">
                {comment.length} / {maxLength}
              </div>
            </div>
            {url && url.trim().length > 0 && (
              <div tw="p-3 flex items-center gap-2">
                {getIcon('link', darkMode ? '#fff' : '#000')}{' '}
                <a
                  href={url}
                  rel="noreferrer"
                  target="_blank"
                  tw="underline text-[17px] text-dark dark:text-light"
                >
                  {url}
                </a>
              </div>
            )}
            <div tw="p-3 flex justify-between items-center bg-dark/5 dark:bg-light/5">
              {(props.allowUrl || props.allowMedia) && (
                <StyledButton
                  onClick={() => {
                    setUrlCopy(url);
                    setMediaCopy(media);
                    setShowAddPopup(true);
                  }}
                >
                  {getIcon('add', darkMode ? '#000' : '#fff')}
                </StyledButton>
              )}
              <StyledButton outlined={saving} onClick={handleSubmit}>
                {saving ? 'Saving...' : 'Comment'}
              </StyledButton>
            </div>
          </>
        ) : (
          <div tw="p-4 italic text-center text-dark/50 dark:text-light/50">
            Commenting is disabled.
          </div>
        )}
      </div>
      {!loading &&
        comments.map((item) => <CommentItem key={item._id} data={item} />)}
      {loading && (
        <div tw="py-6 text-[17px] text-dark/75 dark:text-light/75">
          Loading comments...
        </div>
      )}
    </div>
  );
};

export default CommentWidget;
