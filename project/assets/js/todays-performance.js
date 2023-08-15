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
              serviceKey: "b5c0289f-a465-4bd4-bb80-37b3b12a1150",
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

  // 14개의 공연 포스터 생성
  for (let i = 0; i < 14; i++) {
    // article태그 생성과 클래스 이름 적용
    const article = document.createElement("article");
    article.className = "performanceArticle";
    // img태그 생성과 img 적용
    const img = document.createElement("img");
    img.className = "hvr-grow";
    img.src = json[i].referenceIdentifier;
    // a태그 생성과 url 적용
    const a = document.createElement("a");
    a.href = json[i].url;
    a.target = "_blank";
    a.rel = "noreferrer";
    // #todays_performance > article > a > img
    a.appendChild(img);
    article.appendChild(a);
    document.querySelector("#todays_performance").appendChild(article);
  }
}

export default todaysPerformance();
