import api from "@/lib/api";

const dashboardService = {

    async getStats(){

        const res = await api.get("/dashboard");

        return res.data.data;

    }

};

export default dashboardService;