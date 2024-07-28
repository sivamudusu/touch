
const Community = require("../models/community.model");
const User = require("../models/user.model");
const Post = require("../models/post.model");

const search2 = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const userId = req.userId;
    const communities = await Community.find({ members: userId }).distinct(
      "_id"
    );

    const [users, posts, joinedCommunity, community] = await Promise.all([
      User.find(
        { $text: { $search: searchQuery } },
        { score: { $meta: "textScore" } }
      )
        .select("_id name email avatar")
        .sort({ score: { $meta: "textScore" } })
        .lean(),
      Post.find({
        community: { $in: communities },
        $text: { $search: searchQuery },
      })
        .select("_id content")
        .populate("user", "name avatar")
        .populate("community", "name")
        .lean()
        .exec(),
      Community.findOne({
        $text: { $search: searchQuery },
        members: { $in: userId },
      }).select("_id name description banner members"),
      Community.findOne({
        $text: { $search: searchQuery },
        members: { $nin: userId },
      }).select("_id name description banner members"),
    ]);

    posts.forEach((post) => {
      if (post.content.length > 30) {
        post.content = post.content.substring(0, 30) + "...";
      }
    });

    res.status(200).json({ posts, users, community, joinedCommunity });
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
};

const search = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const userId = req.userId;

    // Find all communities the user is a member of
    const userCommunities = await Community.findAll({
      attributes: ['id'],
      include: [{
        model: User,
        where: { id: userId },
        attributes: []
      }]
    });

    const communityIds = userCommunities.map(community => community.id);

    const [users, posts, joinedCommunity, community] = await Promise.all([
      User.findAll({
        where: Sequelize.literal(`to_tsvector('english', "name") @@ to_tsquery('english', :searchQuery)`),
        replacements: { searchQuery },
        attributes: ['id', 'name', 'email', 'avatar'],
        order: [
          [Sequelize.literal('ts_rank_cd(to_tsvector("name"), to_tsquery(:searchQuery))'), 'DESC']
        ]
      }),
      Post.findAll({
        where: {
          communityId: { [Op.in]: communityIds },
          [Op.or]: [
            Sequelize.literal(`to_tsvector('english', "content") @@ to_tsquery('english', :searchQuery)`)
          ]
        },
        replacements: { searchQuery },
        attributes: ['id', 'content'],
        include: [
          { model: User, attributes: ['name', 'avatar'] },
          { model: Community, attributes: ['name'] }
        ],
        order: [
          [Sequelize.literal('ts_rank_cd(to_tsvector("content"), to_tsquery(:searchQuery))'), 'DESC']
        ]
      }),
      Community.findOne({
        where: {
          [Op.and]: [
            Sequelize.literal(`to_tsvector('english', "name" || ' ' || "description") @@ to_tsquery('english', :searchQuery)`),
            { id: { [Op.in]: communityIds } }
          ]
        },
        replacements: { searchQuery },
        attributes: ['id', 'name', 'description', 'banner']
      }),
      Community.findOne({
        where: {
          [Op.and]: [
            Sequelize.literal(`to_tsvector('english', "name" || ' ' || "description") @@ to_tsquery('english', :searchQuery)`),
            { id: { [Op.notIn]: communityIds } }
          ]
        },
        replacements: { searchQuery },
        attributes: ['id', 'name', 'description', 'banner']
      })
    ]);

    posts.forEach(post => {
      if (post.content.length > 30) {
        post.content = post.content.substring(0, 30) + '...';
      }
    });

    res.status(200).json({ posts, users, community, joinedCommunity });

    console.log({ posts, users, community, joinedCommunity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

module.exports = search;
