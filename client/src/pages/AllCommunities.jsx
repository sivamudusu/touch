import { useEffect, useState } from "react";
import { getNotJoinedCommunitiesAction, createCommunityAction } from "../redux/actions/communityActions";
import { useDispatch, useSelector } from "react-redux";
import CommonLoading from "../components/loader/CommonLoading";
import CommunityCard from "../components/community/CommunityCard";

const AllCommunities = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    banner: ""
  });

  const notJoinedCommunities = useSelector(
    (state) => state.community?.notJoinedCommunities
  );

  useEffect(() => {
    dispatch(getNotJoinedCommunitiesAction());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    
    dispatch(createCommunityAction(formData.name));
    // Clear form
    setFormData({
      name: "",
      description: "",
      banner: ""
    });
  };

  if (!notJoinedCommunities) {
    return (
      <div className="main-section flex items-center justify-center">
        <CommonLoading />
      </div>
    );
  }

  return (
    <div className="main-section flex flex-col gap-8">
      <div className="grid grid-cols-1 items-center gap-5 bg-white px-4 py-4 md:grid-cols-2 border">
        {notJoinedCommunities?.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      {/* Create Community Form */}
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Create New Community</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Community Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter community name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Describe your community"
            />
          </div>

          <div>
            <label htmlFor="banner" className="block text-sm font-medium text-gray-700 mb-1">
              Banner URL (Optional)
            </label>
            <input
              type="url"
              id="banner"
              name="banner"     
              value={formData.banner}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter banner image URL"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors w-full md:w-auto md:self-start"
          >
            Create Community
          </button>
        </form>
      </div>
    </div>
  );
};

export default AllCommunities;