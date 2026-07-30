import { api } from "./api";

const authService = {
  login(data: any) {
    return api.post("/auth/login", data);
  },

  logout() {
    return api.post("/auth/logout");
  },

  me() {
    return api.get("/auth/me");
  },
};

export default authService;
