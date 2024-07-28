import { useEffect, useState } from "react";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getCommunityAction } from "../../redux/actions/communityActions";
import Save from "./Save";
import Like from "./Like";
import CommentForm from "../form/CommentForm";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import DeleteModal from "../modals/DeleteModal";
import { IoIosArrowBack } from "react-icons/io";
import CommonLoading from "../loader/CommonLoading";
import "react-photo-view/dist/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import ReportPostModal from "../modals/ReportPostModal";
import { VscReport } from "react-icons/vsc";
import Tooltip from "../shared/Tooltip";

const PostView = ({ post, userData }) => {
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    content,
    fileUrl,
    fileType,
    User,
    Community,
    dateTime,
    comments,
    savedByCount,
    isReported,
  } = post;

  console.log(post,userData);

  useEffect(() => {
    console.log("called in post view");
    dispatch(getCommunityAction(Community.name)).then(() => setLoading(false));
  }, [dispatch, Community.name, loading]);

  const [showModal, setShowModal] = useState(false);
  const toggleModal = (value) => {
    setShowModal(value);
  };

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportedPost, setIsReportedPost] = useState(isReported);

  const handleReportClick = () => {
    setIsReportModalOpen(true);
  };

  const handleReportClose = () => {
    setIsReportModalOpen(false);
  };

  if (loading) {
    return (
      <div className="main-section flex justify-center items-center">
        <CommonLoading />
      </div>
    );
  }

  return (
    <div className="main-section border p-5 bg-white rounded-lg shadow-md">
      <p className="border border-dashed border-primary cursor-pointer px-2 py-2 w-7 h-7 flex justify-center items-center mb-3 rounded-full">
        <IoIosArrowBack
          className="text-primary text-lg font-semibold"
          onClick={() => navigate(location.state?.from || "/")}
        />
      </p>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <img
            className="rounded-full overflow-hidden w-12 h-12 object-cover"
            src={User.avatar}
            alt="user avatar"
            loading="lazy"
          />
          <div className="flex flex-col">
            {userData.id === User.id ? (
              <Link to="/profile" className="text-lg font-semibold">
                {User.name}
              </Link>
            ) : (
              <Link to={`/user/${User.id}`} className="text-lg font-semibold">
                {User.name}
              </Link>
            )}
            <Link
              to={`/community/${Community.name}`}
              className="text-xs text-gray-500"
            >
              {Community.name}
            </Link>
          </div>
        </div>

        <span className="text-gray-500 text-sm self-center">{dateTime}</span>
      </div>

      <div className="mb-4">
        <p className="my-2">{content}</p>
        <div className="flex justify-center">
          {fileUrl && fileType === "image" ? (
            <PhotoProvider
              overlayRender={() => (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-10 text-white px-3 py-2">
                  <p className="text-xs">{User.name}</p>
                  <p className="text-xs">{Community.name}</p>
                  <p className="text-xs">{dateTime}</p>
                </div>
              )}
            >
              <PhotoView src={fileUrl}>
                <div className="w-full aspect-w-1 aspect-h-1">
                  <img
                    src={fileUrl}
                    alt={content}
                    loading="lazy"
                    className="cursor-pointer object-cover rounded-md"
                  />
                </div>
              </PhotoView>
            </PhotoProvider>
          ) : (
            fileUrl && (
              <div className="w-full aspect-w-16 aspect-h-9">
                <video
                  className="block mx-auto rounded-md focus:outline-none"
                  src={fileUrl}
                  controls
                />
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Like post={post} />
          <button className="flex items-center space-x-1">
            <HiOutlineChatBubbleOvalLeft className="text-2xl" />
            <span className="text-lg">{comments.length}</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <Save postId={post.id} />
          <Tooltip text="Saved by" className="items-center">
            <div className="flex items-center">
              <HiOutlineArchiveBox className="text-2xl" />
              {savedByCount}
            </div>
          </Tooltip>
          {isReportedPost ? (
            <Tooltip text="Reported" className="items-center">
              <button disabled className="text-green-500">
                <VscReport className="text-2xl" />
              </button>
            </Tooltip>
          ) : (
            <Tooltip text="Report">
              <button onClick={handleReportClick}>
                <VscReport className="text-2xl" />
              </button>
            </Tooltip>
          )}
          {userData?.id === post.userId && (
            <Tooltip text="Delete">
              <button
                onClick={() => toggleModal(true)}
                className="text-red-500"
              >
                <HiOutlineArchiveBox className="text-2xl" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        showModal={showModal}
        postId={post.id}
        onClose={() => toggleModal(false)}
        prevPath={location.state.from || "/"}
      />

      <ReportPostModal
        isOpen={isReportModalOpen}
        onClose={handleReportClose}
        postId={post.id}
        communityId={Community.id}
        setReportedPost={setIsReportedPost}
      />

      <div>
        <CommentForm communityId={Community.id} postId={post.id} />
      </div>
    </div>
  );
};

export default PostView;
