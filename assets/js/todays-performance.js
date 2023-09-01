// KOPIS Performance List API
// performanceListAPI(numOfRows, currentPage)
import performanceListAPI from "./performanceListAPI.js";

if (localStorage.getItem("performance") !== null) {
  todaysPerformance(JSON.parse(localStorage.getItem("performance")));
} else {
  // 공연 데이터를 가져옵니다
  performanceListAPI(14, 1)
    .then((json) => {
      let performanceArray = json.slice(0, 14);
      todaysPerformance(performanceArray);
      localStorage.setItem("performance", JSON.stringify(performanceArray));
    })
    .catch((e) => {
      console.error(e);
      alert(e);
    });
}

/**
 * 메인 페이지에 공연 포스터와 url을 생성합니다
 * @param {Array} performanceArray : 공연 정보를 담은 배열
 */
function todaysPerformance(performanceArray) {
  performanceArray.forEach((performance) => {
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
}
