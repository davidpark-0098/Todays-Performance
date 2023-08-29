// KOPIS Performance List API
import performanceListAPI from "./performanceListAPI.js";

function todaysPerformance() {
  // 공연 데이터를 가져옵니다
  // performanceListAPI(numOfRows, currentPage)
  performanceListAPI(14, 1)
    .then((json) => {
      // index의 지정 값 만큼 공연 포스터와 url를 생성합니다
      json.forEach((performance) => {
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
      });
    })
    .catch((e) => {
      console.error(e);
      alert(e);
    });
}

export default todaysPerformance();
