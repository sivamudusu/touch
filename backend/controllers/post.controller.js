const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);
const formatCreatedAt = require("../utils/timeConverter");

const { Post, User, Community, Comment, Like } = require('../models');  // Import all models from index.js
const Sequelize = require('sequelize');
const fs = require('fs').promises;
const path = require('path');
const Relationship = require("../models/relationship.model");
const Report = require("../models/report.model");
const PendingPost = require("../models/pendingPost.model");
const { where } = require("sequelize");

const createPost = async (req, res) => {
  try {
    const postContent = req.body.content;
    const communityName = req.body.communityName;
    
    console.log('Request body:', req.body);
    
    // Validate required fields
    if (!postContent || !communityName) {
      return res.status(400).json({
        message: "Post content and community name are required"
      });
    }

    // Find the community
    const community = await Community.findOne({
      where: { name: communityName }
    });

    if (!community) {
      return res.status(404).json({
        message: "Community not found"
      });
    }

    // Create the post with validated data
    const postData = {
      content: postContent.trim(),
      userId: req.userId,
      communityId: community.id
    };

    // Add file data if present
    if (req.file) {
      postData.fileUrl = `/uploads/${req.file.filename}`;
      postData.fileType = req.file.mimetype;
    }

    // Create the post
    const post = await Post.create(postData);

    // Fetch the created post with associations
    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Community,
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json(createdPost);
  } catch (error) {
    console.error('Error creating post:', error);
    console.error('Request body:', req.body);
    res.status(500).json({
      message: "Error creating post",
      error: error.message
    });
  }
};

const confirmPost = async (req, res) => {
  try {
    const { confirmationToken } = req.params;
    const userId = req.userId;
    const pendingPost = await PendingPost.findOne({
      confirmationToken: { $eq: confirmationToken },
      status: "pending",
      user: userId,
    });
    if (!pendingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { user, community, content, fileUrl, fileType } = pendingPost;
    const newPost = new Post({
      user,
      community,
      content,
      fileUrl,
      fileType,
    });

    await PendingPost.findOneAndDelete({
      confirmationToken: { $eq: confirmationToken },
    });
    const savedPost = await newPost.save();
    const postId = savedPost._id;

    const post = await Post.findById(postId)
      .populate("user", "name avatar")
      .populate("community", "name")
      .lean();

    post.createdAt = dayjs(post.createdAt).fromNow();

    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: "Error publishing post",
    });
  }
};

const rejectPost = async (req, res) => {
  try {
    const { confirmationToken } = req.params;
    const userId = req.userId;
    const pendingPost = await PendingPost.findOne({
      confirmationToken: { $eq: confirmationToken },
      status: "pending",
      user: userId,
    });

    if (!pendingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    await pendingPost.remove();
    res.status(201).json({ message: "Post rejected" });
  } catch (error) {
    res.status(500).json({
      message: "Error rejecting post",
    });
  }
};

const clearPendingPosts = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== "moderator") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const date = new Date();
    date.setHours(date.getHours() - 1);

    await PendingPost.deleteMany({ createdAt: { $lte: date } });

    res.status(200).json({ message: "Pending posts cleared" });
  } catch (error) {
    res.status(500).json({
      message: "Error clearing pending posts",
    });
  }
};
const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Community,
          attributes: ['id', 'name']
        },
        {
          model: Comment,
          separate: true,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'avatar']
            }
          ]
        },
        {
          model: Like,
          separate: true
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // Format the post to match frontend requirements
    const formattedPost = {
      ...post.get({ plain: true }),
      createdAt: dayjs(post.createdAt).fromNow(),
      Comments: post.Comments || [],
      Likes: (post.Likes || []).map(like => like.userId),
      author: post.author,
      Community: post.Community
    };

    res.status(200).json(formattedPost);
  } catch (error) {
    console.error('Error getting post:', error);
    console.error('Request params:', req.params);
    res.status(500).json({
      message: "Error retrieving post",
      error: error.message
    });
  }
};

const findPostById = async (postId) =>
  await Post.findById(postId)
    .populate("user", "name avatar")
    .populate("community", "name")
    .lean();

const findCommentsByPostId = async (postId) =>
  await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "name avatar")
    .lean();

const formatComments = (comments) =>
  comments.map((comment) => ({
    ...comment,
    createdAt: dayjs(comment.createdAt).fromNow(),
  }));

const countSavedPosts = async (postId) =>
  await User.countDocuments({ savedPosts: postId });

const findReportByPostAndUser = async (postId, userId) =>
  await Report.findOne({ post: postId, reportedBy: userId });

  const getPosts = async (req, res) => {
    try {
      const userId = req.userId;
      const { limit = 10, skip = 0 } = req.query;
  
      const communities = await Community.findAll({
        include: [{ model: User, as: 'members', where: { id: userId } }]
      });
  
      const communityIds = communities.map((community) => community.id);
  
      const posts = await Post.findAll({
        where: { communityId: communityIds },
        include: [
          { 
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatar']
          },
          { 
            model: Community,
            attributes: ['id', 'name']
          },
          {
            model: Comment,
            separate: true,
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'avatar']
              }
            ]
          },
          {
            model: Like,
            separate: true
          }
        ],
        order: [['createdAt', 'DESC']],
        offset: parseInt(skip),
        limit: parseInt(limit)
      });
  
      const formattedPosts = posts.map((post) => {
        const plainPost = post.get({ plain: true });
        return {
          ...plainPost,
          createdAt: dayjs(plainPost.createdAt).fromNow(),
          Comments: plainPost.Comments || [],
          Likes: (plainPost.Likes || []).map(like => like.userId),
          author: plainPost.author,
          Community: plainPost.Community
        };
      });
  
      const totalPosts = await Post.count({ where: { communityId: communityIds } });

  
      res.status(200).json({
        formattedPosts,
        totalPosts,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving posts",
      });
    }
  };

/**
 * Retrieves the posts for a given community, including the post information, the number of posts saved by each user,
 * the user who created it, and the community it belongs to.
 *
 * @route GET /posts/community/:communityId
 */
const getCommunityPosts = async (req, res) => {
  try {
    const { communityId } = req.params;
    
    console.log('Getting posts for community:', communityId);

    if (!communityId) {
      return res.status(400).json({
        message: "Community ID is required"
      });
    }

    const community = await Community.findOne({
      where: { id: communityId }
    });

    if (!community) {
      return res.status(404).json({
        message: "Community not found"
      });
    }

    const posts = await Post.findAll({
      where: { communityId: community.id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Community,
          attributes: ['id', 'name']
        },
        {
          model: Comment,
          separate: true,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'avatar']
            }
          ]
        },
        {
          model: Like,
          separate: true
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format the posts to match your frontend requirements
    const formattedPosts = posts.map(post => {
      const plainPost = post.get({ plain: true });
      return {
        ...plainPost,
        createdAt: dayjs(plainPost.createdAt).fromNow(),
        Comments: plainPost.Comments || [],
        Likes: (plainPost.Likes || []).map(like => like.userId),
        author: plainPost.author,
        Community: plainPost.Community
      };
    });

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('Error getting community posts:', error);
    console.error('Request params:', req.params);
    res.status(500).json({
      message: "Error getting posts",
      error: error.message
    });
  }
};


/**
 * Retrieves the posts of the users that the current user is following in a given community
 *
 * @route GET /posts/:id/following
 */
const getFollowingUsersPosts = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.userId;

    const following = await Relationship.find({
      follower: userId,
    });

    const followingIds = following.map(
      (relationship) => relationship.following
    );

    const posts = await Post.find({
      user: {
        $in: followingIds,
      },
      community: communityId,
    })
      .sort({
        createdAt: -1,
      })
      .populate("user", "name avatar")
      .populate("community", "name")
      .limit(20)
      .lean();

    const formattedPosts = posts.map((post) => ({
      ...post,
      createdAt: dayjs(post.createdAt).fromNow(),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found. It may have been deleted already",
      });
    }

    await post.remove();
    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: "An error occurred while deleting the post",
    });
  }
};

const populatePost = async (post) => {
  const savedByCount = await User.countDocuments({
    savedPosts: post._id,
  });

  return {
    ...post.toObject(),
    createdAt: dayjs(post.createdAt).fromNow(),
    savedByCount,
  };
};

/**
 * @param {string} req.params.id - The ID of the post to be liked.
 * @param {string} req.userId - The ID of the user liking the post.
 */


const likePost = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;


    // Check if the post exists and if the user has already liked it
    // const post = await Post.findOne({
    //   where: { id },
    //   include: [{ model: Like, where: { userId } }]
    // });

    // if (!post) {
    //   return res.status(404).json({
    //     message: "Post not found or user has already liked the post",
    //   });
    // }

    // Add the like
    await Like.create({ postId: id, userId:userId });

    // Fetch the updated post with user and community details
    // const updatedPost = await Post.findOne({
    //   where: { id },
    //   include: [{ model: User, attributes: ['name', 'avatar'] }, { model: Community, attributes: ['name'] }]
    // });

    // const formattedPost = {
    //   ...updatedPost.toJSON(),
    //   user: { name: updatedPost.User.name, avatar: updatedPost.User.avatar },
    //   community: { name: updatedPost.Community.name }
    // };

    res.status(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error liking post",
    });
  }
};


const unlikePost = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;

    await Like.destroy({
      where: {
        postId: id,
        userId: userId,
      }
    });

    // const updatedPost = await Post.findOneAndUpdate(
    //   {
    //     _id: id,
    //     likes: userId,
    //   },
    //   {
    //     $pull: {
    //       likes: userId,
    //     },
    //   },
    //   {
    //     new: true,
    //   }
    // )
    //   .populate("user", "name avatar")
    //   .populate("community", "name");

    // if (!updatedPost) {
    //   return res.status(404).json({
    //     message: "Post not found. It may have been deleted already",
    //   });
    // }

    // const formattedPost = await populatePost(updatedPost);

    res.status(200)
  } catch (error) {
    res.status(500).json({
      message: "Error unliking post",
    });
  }
};

const addComment = async (req, res) => {
  console.log("in comment section");
  try {
    const { content, postId } = req.body;
    const userId = req.userId;
    console.log(userId);
    const newComment = await Comment.create({
      userId: userId,
      postId: postId,
      content,
    });

    console.log(newComment);
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await post.addComment(newComment);
    res.status(200).json({
      message: "Comment added successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding comment",
    });
  }
};

const savePost = async (req, res) => {
  await saveOrUnsavePost(req, res, "$addToSet");
};

const unsavePost = async (req, res) => {
  await saveOrUnsavePost(req, res, "$pull");
};

/**
 * Saves or unsaves a post for a given user by updating the user's
 * savedPosts array in the database. Uses $addToSet or $pull operation based on the value of the operation parameter.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param {string} operation - The operation to perform, either "$addToSet" to save the post or "$pull" to unsave it.
 */
const saveOrUnsavePost = async (req, res, operation) => {
  try {
    /**
     * @type {string} id - The ID of the post to be saved or unsaved.
     */
    const id = req.params.id;
    const userId = req.userId;

    const update = {};
    update[operation === "$addToSet" ? "$addToSet" : "$pull"] = {
      savedPosts: id,
    };
    const updatedUserPost = await User.findOneAndUpdate(
      {
        _id: userId,
      },
      update,
      {
        new: true,
      }
    )
      .select("savedPosts")
      .populate({
        path: "savedPosts",
        populate: {
          path: "community",
          select: "name",
        },
      });

    if (!updatedUserPost) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const formattedPosts = updatedUserPost.savedPosts.map((post) => ({
      ...post.toObject(),
      createdAt: dayjs(post.createdAt).fromNow(),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * @route GET /posts/saved
 */
const getSavedPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /**
     * send the saved posts of the communities that the user is a member of only
     */
    const communityIds = await Community.find({ members: userId }).distinct(
      "_id"
    );
    const savedPosts = await Post.find({
      community: { $in: communityIds },
      _id: { $in: user.savedPosts },
    })
      .populate("user", "name avatar")
      .populate("community", "name");

    const formattedPosts = savedPosts.map((post) => ({
      ...post.toObject(),
      createdAt: dayjs(post.createdAt).fromNow(),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * Retrieves up to 10 posts of the public user that are posted in the communities
 * that both the public user and the current user are members of.
 *
 * @route GET /posts/:publicUserId/userPosts
 *
 * @param req.userId - The id of the current user.
 *
 * @param {string} req.params.publicUserId - The id of the public user whose posts to retrieve.
 */
const getPublicPosts = async (req, res) => {
  try {
    const publicUserId = req.params.publicUserId;
    const currentUserId = req.userId;

    const isFollowing = await Relationship.exists({
      follower: currentUserId,
      following: publicUserId,
    });
    if (!isFollowing) {
      return null;
    }

    const commonCommunityIds = await Community.find({
      members: { $all: [currentUserId, publicUserId] },
    }).distinct("_id");

    const publicPosts = await Post.find({
      community: { $in: commonCommunityIds },
      user: publicUserId,
    })
      .populate("user", "_id name avatar")
      .populate("community", "_id name")
      .sort("-createdAt")
      .limit(10)
      .exec();

    const formattedPosts = publicPosts.map((post) => ({
      ...post.toObject(),
      createdAt: dayjs(post.createdAt).fromNow(),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPost,
  getPosts,
  createPost,
  getCommunityPosts,
  deletePost,
  rejectPost,
  clearPendingPosts,
  confirmPost,
  likePost,
  unlikePost,
  addComment,
  savePost,
  unsavePost,
  getSavedPosts,
  getPublicPosts,
  getFollowingUsersPosts,
};