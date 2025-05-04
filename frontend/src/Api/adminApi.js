import interceptor from "./interceptor";

const adminApi = {
  getAllUsers: async () => {
    const res = await interceptor.get("/admin/users");
    return res.data;
  },
};

export default adminApi;