import KOPIS_PERFORMANCE_LIST_SERVICE_KEY from "./key.js";

// KOPIS 공연목록 open api json datasets
async function todaysPerformance() {
  let json = null;

  try {
    /**/
    // test api json
    const response = await axios.get("http://localhost:3001/response");
    json = response.data.body.items.item;
    /*/
    // api json
    const response = await axios.get("http://api.kcisa.kr/openapi/service/rest/meta16/getkopis01", {
      params: {
        serviceKey: KOPIS_PERFORMANCE_LIST_SERVICE_KEY,
        numOfRows: 14,
        pageNo: 1,
      },
      header: {
        accept: "application/json",
      },
    });
    json = response.data.response.body.items.item;
    /**/
  } catch (e) {
    console.error(e);
    alert("요청을 처리하는데 실패했습니다.");
    return;
  }

  // index의 지정 값 만큼 공연 포스터와 url를 생성합니다
  json.some((performance, index) => {
    console.log(index);
    // article태그 생성과 클래스 이름 적용
    const article = document.createElement("article");
    article.className = "performanceArticle";

    // img태그 생성과 img 적용
    const img = document.createElement("img");
    img.className = "hvr-grow";
    img.src = performance.referenceIdentifier;

    // a태그 생성과 url 적용
    const a = document.createElement("a");
    a.href = performance.url;
    a.target = "_blank";
    a.rel = "noreferrer";

    // #todays_performance > article > a > img
    a.appendChild(img);
    article.appendChild(a);
    document.querySelector("#todays_performance").appendChild(article);

    return index === 13 ? true : false;
  });
}

export default todaysPerformance();
