import KOPIS_PERFORMANCE_LIST_SERVICE_KEY from "./key.js";

/**
 * 공연 데이터를 HTML로 생성합니다
 * @param {Date} selectedDate : 선택한 날짜
 * @param {String} selectedGenre : 선택한 장르
 * @param {String} searchedQuery : 검색어
 * @param {Number} currentPage : 검색한 현재 페이지
 * @param {Number} totalMatchedPerformance : 검색한 모든 페이지의 matchedPerformance 총 개수
 * @returns
 */
async function searchPerformanceOutput(selectedDate, selectedGenre, searchedQuery, currentPage = 1, totalMatchedPerformance = 0) {
  document.querySelector("#loading").classList.add("active"); // 로딩창 띄우기

  let json = null; // json data
  let matchedPerformance = 0; // currentPage에서 검색 조건과 일치하는 공연 결과 개수
  const numOfRows = 40; // 한 페이지에 불러올 총 데이터 개수

  try {
    /**
    // test api json
    const response = await axios.get("http://localhost:3001/response");
    json = response.data.body.items.item;
    /*/
    // api json
    const response = await axios.get("http://api.kcisa.kr/openapi/service/rest/meta16/getkopis01", {
      params: {
        serviceKey: KOPIS_PERFORMANCE_LIST_SERVICE_KEY,
        numOfRows: numOfRows,
        pageNo: currentPage,
      },
      header: {
        accept: "application/json",
      },
    });

    json = response.data.response.body.items.item;
    /**/
  } catch (error) {
    console.error(`[Error Code] ${error.code}`);
    console.error(`[Error Message] ${error.message}`);
    let alertMsg = error.message;

    if (error.response !== undefined) {
      const errorMsg = `${error.response.status} error - ${error.response.statusText}`;
      console.error(`[HTTP Status] ${errorMsg}`);
      alertMsg += `\n${errorMsg}`;
    }

    alert(alertMsg);
    return;
  }

  /**
   * 아래는 json의 데이터 중 공연 하나의 예시입니다
   * collectionDb: "kopis01_공연목록";
   * creator: "홈페이지";
   * language: "kor";
   * referenceIdentifier: "http://www.kopis.or.kr/upload/pfmPoster/PF_PF153974_190903_094953.gif";
   * spatialCoverage: "성남아트센터";
   * subDescription: "공연상태: 공연완료 오픈런: N";
   * subjectCategory: "콘서트";
   * temporalCoverage: "2019.12.07~2019.12.07";
   * title: "장윤정 라이브 콘서트 [성남]";
   * url: "http://www.kopis.or.kr/por/db/pblprfr/pblprfrView.do?menuId=MNU_00020&mt20Id=PF153974#20819";
   */

  /**
   * json data의 기간을 배열로 변환하여, 시작 날짜의 데이터를 반환합니다
   * @param {Object} : json의 한개 데이터
   */
  const periodStartDate = (performanceData) => new Date(performanceData.temporalCoverage.replaceAll(".", "-").split("~")[0]);

  json
    .filter((p) => {
      // 가져오는 api 공연 데이터가 2023년도 기준에 미치지 않기 때문에, 모든 공연 시작과 끝 날짜에 4년을 더합니다.
      const performanceStartDate = periodStartDate(p).setFullYear(periodStartDate(p).getFullYear() + 4);

      // 출력한 공연 검색 결과 개수가 40개 미만일때 통과
      if (!(matchedPerformance <= 40)) return false;

      // 선택한 날짜가 공연 시작 날짜보다 클때 통과
      if (!(selectedDate <= performanceStartDate)) return false;

      // 선택한 장르가 일치하거나 전체일때 통과
      if (!(selectedGenre === p.subjectCategory || selectedGenre === "전체")) return false;

      // 검색어가 있다면, 공연 제목 또는 공연 장소 중 검색어에 포함되어 있을때 통과
      if (!(searchedQuery ? p.title.includes(searchedQuery) || p.spatialCoverage.includes(searchedQuery) : true)) return false;

      // 조건에 부합하는 Object 데이터 배열로 반환
      return true;
    })
    // 검색 조건에 부합하는 데이터에서, 공연 시작 날짜를 기준으로 데이터를 오름차순으로 정렬
    .sort((a, b) => periodStartDate(a) - periodStartDate(b))
    // 정렬된 공연 데이터를 html로 생성
    .some((mp, i) => {
      document.querySelector("#loading").classList.remove("active"); // 로딩바 닫기

      // article태그 생성
      const performanceArticle = document.createElement("article");

      // img태그 생성과 공연 포스터 속성 적용
      const posterImg = document.createElement("img");
      posterImg.classList.add("posterImg");
      // 포스터가 없는 데이터의 경우 "  " 이렇게 표시 되기 때문에, trim() 이후 포스터가 없다면 no-img.jpg를 표시한다
      posterImg.src = mp.referenceIdentifier.trim() || "./assets/img/no-img.jpg";

      // a태그 생성과 공연 제목 작성
      const titleA = document.createElement("a");
      titleA.className = "titleA";
      titleA.href = mp.url;
      titleA.target = "_blank";
      titleA.rel = "noreferrer";
      titleA.innerHTML = mp.title;

      // a태그 생성과 공연장 작성
      const venueA = document.createElement("a");
      venueA.className = "venueA";
      venueA.href = `http://127.0.0.1:5500/project/search-venue.html?venue=${mp.spatialCoverage}`;
      venueA.target = "_blank";
      venueA.rel = "noreferrer";
      venueA.innerHTML = mp.spatialCoverage;

      // span태그 생성과 장르 작성
      const genreSpan = document.createElement("span");
      genreSpan.className = "genreSpan";
      genreSpan.innerHTML = mp.subjectCategory;

      // span태그 생성과 기간 작성
      const periodSpan = document.createElement("span");
      periodSpan.className = "periodSpan";
      /** api가 대부분 과거의 공연정보 이기 때문에 공연 기간에 임시로 3년을 더해서 표현합니다. */
      periodSpan.innerHTML = mp.temporalCoverage
        .replaceAll("2022", "2026")
        .replaceAll("2021", "2025")
        .replaceAll("2020", "2024")
        .replaceAll("2019", "2023")
        .replaceAll("2018", "2022")
        .replaceAll("2017", "2021");

      // output_section > artilce > img, a, a, span, span
      performanceArticle.appendChild(posterImg);
      performanceArticle.appendChild(titleA);
      performanceArticle.appendChild(venueA);
      performanceArticle.appendChild(genreSpan);
      performanceArticle.appendChild(periodSpan);
      document.getElementById("output_section").appendChild(performanceArticle);

      // 공연 데이터 카운트
      matchedPerformance++;
      totalMatchedPerformance++;

      if (totalMatchedPerformance >= 10) return true;
    });

  console.log(currentPage + "번째 페이지의 검색 결과, 일치하는 공연 데이터는" + matchedPerformance + "개 입니다. " + currentPage + "/10");
  currentPage++;

  // currentPage를 1~10 검색합니다
  if (totalMatchedPerformance >= 10 || currentPage === 10) {
    document.querySelector("#loading").classList.remove("active"); // 로딩 제거
    console.log("검색 결과, 모든 총 공연 데이터는 " + totalMatchedPerformance + "개 입니다.");
    return;
  } else {
    searchPerformanceOutput(selectedDate, selectedGenre, searchedQuery, currentPage, totalMatchedPerformance);
  }
}

export default searchPerformanceOutput;
