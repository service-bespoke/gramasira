import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost/waterbilling/index.php/api",
  baseURL:
    "https://gramasira.bespokewebdesignllc.com/waterbilling/index.php/api",

  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default api;
