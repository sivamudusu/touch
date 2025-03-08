import { ADMIN_API, handleApiError } from "./utils";
export const signIn = async (credential) => {
    try {
      const res = await ADMIN_API.post("/signin", credential);
      return { error: null, data: res.data };
    } catch (error) {
      return handleApiError(error);
    }
  };
  export const getLogs = async () => {
    try {
      const res = await ADMIN_API.get("/logs");
      return { error: null, data: res.data };
    } catch (error) {
      return handleApiError(error);
    }
  };
  
  export const deleteLogs = async () => {
    try {
      await ADMIN_API.delete("/logs");
    } catch (error) {
      return handleApiError(error);
    }
  };