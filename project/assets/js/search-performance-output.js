import KOPIS_KEY from "./key.js";

/**
 * 공연 데이터를 HTML로 생성합니다
 * @param {Date} selectedDate : 선택한 날짜
 * @param {String} selectedGenre : 선택한 장르
 * @param {String} searchedQuery : 검색어
 * @returns
 */
async function searchPerformanceOutput(selectedDate, selectedGenre, searchedQuery) {
  document.querySelector("#loading").classList.add("active"); // 로딩창 띄우기

  // variable
  let json = null; // json data
  let currentPage = 1; // 현재 검색한 페이지
  let count = 0; // 현재 출력된 검색 결과의 개수

  try {
    /**/
    // test api json
    const response = await axios.get("http://localhost:3001/response");
    json = response.data.body.items.item;
    /*/
    // api json
    const response = await axios.get("http://api.kcisa.kr/openapi/service/rest/meta16/getkopis01", {
      params: {
        serviceKey: KOPIS_KEY,
        numOfRows: 100,
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
    .filter((v) => {
      // 가져오는 api 공연 데이터가 2023년도 기준에 미치지 않기 때문에, 모든 공연 시작과 끝 날짜에 4년을 더합니다.
      const performanceStartDate = periodStartDate(v).setFullYear(periodStartDate(v).getFullYear() + 4);

      // 출력한 공연 검색 결과 개수가 40개 미만일때 통과
      if (!(count <= 40)) return false;

      // 선택한 날짜가 공연 시작 날짜보다 클때 통과
      if (!(selectedDate <= performanceStartDate)) return false;

      // 선택한 장르가 일치하거나 전체일때 통과
      if (!(selectedGenre === v.subjectCategory || selectedGenre === "전체")) return false;

      // 검색어가 있다면, 공연 제목 또는 공연 장소 중 검색어에 포함되어 있을때 통과
      if (!(searchedQuery ? v.title.includes(searchedQuery) || v.spatialCoverage.includes(searchedQuery) : true)) return false;

      // 조건에 부합하는 Object 데이터 배열로 반환
      return true;
    })
    // 검색 조건에 부합하는 데이터에서, 공연 시작 날짜를 기준으로 데이터를 오름차순으로 정렬
    .sort((a, b) => periodStartDate(a) - periodStartDate(b))
    // 정렬된 공연 데이터를 html로 생성
    .forEach((v) => {
      document.querySelector("#loading").classList.remove("active"); // 로딩바 닫기

      const performanceArticle = document.createElement("article");
      count++;

      const posterImg = document.createElement("img");
      posterImg.classList.add("posterImg");
      const titleA = document.createElement("a");
      titleA.classList.add("titleA");
      titleA.href = v.url;
      titleA.target = "_blank";
      titleA.rel = "noreferrer";
      const venueA = document.createElement("a");
      venueA.href = `http://127.0.0.1:5500/project/search-venue.html?venue=${v.spatialCoverage}`;
      venueA.target = "_blank";
      venueA.rel = "noreferrer";
      venueA.classList.add("venueA");

      const genreSpan = document.createElement("span");
      genreSpan.classList.add("genreSpan");
      const periodSpan = document.createElement("span");
      periodSpan.classList.add("periodSpan");

      posterImg.setAttribute("src", v.referenceIdentifier);
      titleA.innerHTML = v.title;
      venueA.innerHTML = v.spatialCoverage;
      genreSpan.innerHTML = v.subjectCategory;
      /** api가 대부분 과거의 공연정보 이기 때문에 공연 기간에 임시로 3년을 더해서 표현합니다. */
      periodSpan.innerHTML = v.temporalCoverage
        .replaceAll("2022", "2026")
        .replaceAll("2021", "2025")
        .replaceAll("2020", "2024")
        .replaceAll("2019", "2023")
        .replaceAll("2018", "2022")
        .replaceAll("2017", "2021");

      performanceArticle.appendChild(posterImg);
      performanceArticle.appendChild(titleA);
      performanceArticle.appendChild(venueA);
      performanceArticle.appendChild(genreSpan);
      performanceArticle.appendChild(periodSpan);

      document.getElementById("output_section").appendChild(performanceArticle);
    });

  // 결과 최대 40개까지만 출력
  if (count < 40) {
    currentPage++;
    console.log("현재 " + count + "개의 검색 결과를 찾았으며 다음 페이지 검색을 시작합니다. page : " + currentPage + "/10");

    // 10페이지 까지만 검색 (1페이지당 1000개의 데이터이며 서버 과부화 방지)
    if (currentPage >= 10) {
      document.querySelector(".span4").innerHTML = count ? count + "개의 공연을 찾았습니다." : "";
      document.querySelector("#loading").classList.remove("active"); // 로딩바 닫기
      console.log(currentPage + "페이지까지 검색했지만 결과가 나오지 않아 검색을 중단합니다.");
      return;
    }
    // searchResults(selectedDate, selectedGenre, searchedQuery, count, currentPage);
  }
}

export default searchPerformanceOutput;
