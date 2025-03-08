// Add these cases to your existing reducer
case "CREATE_COMMUNITY_REQUEST":
  return {
    ...state,
    loading: true,
    error: null,
  };
case "CREATE_COMMUNITY_SUCCESS":
  return {
    ...state,
    loading: false,
    error: null,
  };
case "CREATE_COMMUNITY_FAIL":
  return {
    ...state,
    loading: false,
    error: action.payload,
  }; 