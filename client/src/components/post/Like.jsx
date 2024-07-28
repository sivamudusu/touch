import { useState, useEffect } from "react";
import { HiOutlineHandThumbUp, HiHandThumbUp } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import {
  likePostAction,
  unlikePostAction,
} from "../../redux/actions/postAction";

const Like = ({ post }) => {
  const dispatch = useDispatch();
  const { id, Likes } = post;
  const userData = useSelector((state) => state.auth?.userData);



  const [likeState, setLikeState] = useState({
    liked: Likes.includes(userData.id),
    localLikes: Likes.length,
  });

  useEffect(() => {
    setLikeState({
        liked: Likes.includes(userData.id),
        localLikes: Likes.length,
    });
  }, [post.likes, userData.id]);

  console.log(likeState.liked);

  const toggleLike = async (e) => {
    e.preventDefault();
    const optimisticLikes = likeState.liked
      ? likeState.localLikes - 1
      : likeState.localLikes + 1;

    setLikeState((prevState) => ({
      ...prevState,
      liked: !prevState.liked,
      localLikes: optimisticLikes,
    }));

    try {
      if (likeState.liked) {
        dispatch(unlikePostAction(id));
      } else {
        dispatch(likePostAction(id));
      }
    } catch (error) {
      setLikeState((prevState) => ({
        ...prevState,
        liked: !prevState.liked,
        localLikes: optimisticLikes,
      }));
    }
  };

  return (
    <button
      onClick={toggleLike}
      className="flex items-center cursor-pointer gap-1 text-lg"
    >
      {likeState.liked ? (
        <HiHandThumbUp className="text-2xl" />
      ) : (
        <HiOutlineHandThumbUp className="text-2xl" />
      )}{" "}
      {likeState.localLikes}
    </button>
  );
};

export default Like;
