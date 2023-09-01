import { KOPIS_PERFORMANCE_LIST_API_SERVICE_KEY } from "./key.js";

const performanceListAPI = async (numOfRows = 100, currentPage = 1) => {
  try {
    /**
    // test api json
    const response = await axios.get("http://localhost:3001/response");

    // json data
    return response.data.body.items.item;
    /*/
    // api json
    const response = await axios.get("http://api.kcisa.kr/openapi/service/rest/meta16/getkopis01", {
      params: {
        serviceKey: KOPIS_PERFORMANCE_LIST_API_SERVICE_KEY,
        numOfRows: numOfRows,
        pageNo: currentPage,
      },
      header: {
        accept: "application/json",
      },
    });

    // json data
    return response.data.response.body.items.item;
    /**/
  } catch (e) {
    // axios error
    console.error(`[Error Code] ${e.code}\n[Error Message] ${e.message}\n[HTTP Status] ${e.response.status}\n[HTTP Status Text] ${e.response.statusText}`);
    return;
  }
};

export default performanceListAPI;
