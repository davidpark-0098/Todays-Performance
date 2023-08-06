import { KOPIS_KEY } from "./key.js";

/** 검색
 * searchQeury : 유저가 입력한 검색어
 * chooseDate : 유저가 원하는 날짜
 * gerenField : 유저가 선택한 장르의 배열
 * count : 현재 출력된 검색 결과의 수
 * currentPage : 현재 검색한 API의 page (1페이지당 1000개의 data)
 */

async function searchResults(selectedDate, selectedGenre, searchedQuery) {
  document.querySelector("#loading").classList.add("active"); // 로딩창 띄우기

  // variable
  let json = null; // json data
  let currentPage = 1; // 현재 페이지
  let count = 0; // 검색한 결과의 개수

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

  // json은 공연 데이터입니다.
  json.forEach((v) => {
    const temporalCoverage = v.temporalCoverage.replaceAll(".", "-").split("~");

    // 가져오는 api 공연 데이터가 2023년도 기준에 미치지 않기 때문에, 모든 공연 시작과 끝 날짜에 3년을 더합니다.
    const performanceStartDate = new Date(temporalCoverage[0]);
    performanceStartDate.setFullYear(performanceStartDate.getFullYear() + 4); // 공연 시작 날짜에 3년을 더합니다.
    const performanceEndDate = new Date(temporalCoverage[1]);
    performanceEndDate.setFullYear(performanceEndDate.getFullYear() + 4); // 공연 끝 날짜에 3년을 더합니다.

    // 공연 제목 또는 장소 검색 조건에 따라 구분 합니다.
    let titleFilter = true;
    // 공연 제목 검색
    if (searchedQuery > 0) {
      searchedType == "titleSearchOptions" && v.title.includes(searchedQuery) ? (titleFilter = true) : (titleFilter = false);
      // 공연 장소 검색
      searchedType == "placeSearchOptions" && v.spatialCoverage.includes(searchedQuery) ? (titleFilter = true) : (titleFilter = false);
    }

    // 장르
    if (selectedGenre == v.subjectCategory || selectedGenre == "전체") {
      // 날짜 && 출력수 && 검색어
      if (selectedDate >= performanceStartDate && selectedDate <= performanceEndDate && count <= 40 && titleFilter) {
        document.querySelector("#loading").classList.remove("active"); // 로딩바 닫기

        const div = document.createElement("div");
        div.classList.add("rec_container");
        div.classList.add("animate__animated");
        div.classList.add("animate__fadeInUp");
        div.style.setProperty("--animate-duration", count * 100 + 1000 + "ms");
        count++;

        const img = document.createElement("img");
        img.classList.add("hvr-grow");
        const h3 = document.createElement("h3");
        const h4 = document.createElement("h4");
        const p1 = document.createElement("p");
        const p = document.createElement("p");
        img.setAttribute("src", v.referenceIdentifier);
        h3.innerHTML = v.title;
        h4.innerHTML = v.spatialCoverage;
        p1.innerHTML = v.subjectCategory;

        /** api가 대부분 과거의 공연정보 이기 때문에 공연 기간에 임시로 3년을 더해서 표현합니다. */
        let plusThreeYear = v.temporalCoverage
          .replaceAll("2022", "2025")
          .replaceAll("2021", "2024")
          .replaceAll("2020", "2023")
          .replaceAll("2019", "2022")
          .replaceAll("2018", "2021")
          .replaceAll("2017", "2020");
        p.innerHTML = plusThreeYear;

        div.addEventListener("click", (e) => {
          window.open(v.url);
        });

        div.appendChild(img);
        div.appendChild(h3);
        div.appendChild(h4);
        div.appendChild(p1);
        div.appendChild(p);

        document.querySelector(".row_container").appendChild(div);
      }
    }
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
    searchResults(selectedDate, selectedGenre, searchedType, searchedQuery, count, currentPage);
  }
}

export default searchResults;
