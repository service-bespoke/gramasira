import { api } from "./api";

const settingsService = {
  getSettings() {
    return api.get("/settings");
  },

  saveSettings(data: any) {
    return api.post("/settings/update", data);
  },
};

export default settingsService;
