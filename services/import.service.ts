import { api } from "./api";

const ImportService = {
  upload(formData: FormData) {
    return api.post("/import/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  process(data: any) {
    return api.post("/import/process", data);
  },

  history() {
    return api.get("/import/history");
  },
};

export default ImportService;
