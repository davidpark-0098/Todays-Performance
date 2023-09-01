// KOPIS Performance List API
import performanceListAPI from "./performanceListAPI.js";

/* "title": "장윤정 라이브 콘서트 [성남]",
"creator": "누리집",
"collectionDb": "kopis01_공연목록",
"subjectCategory": "콘서트",
"referenceIdentifier": "http://www.kopis.or.kr/upload/pfmPoster/PF_PF153974_190903_094953.gif",
"language": "kor",
"url": "http://www.kopis.or.kr/por/db/pblprfr/pblprfrView.do?menuId=MNU_00020&mt20Id=PF153974#20819",
"spatialCoverage": "성남아트센터",
"temporalCoverage": "2019.12.07~2019.12.07",
"subDescription": "공연상태: 공연완료 오픈런: N" */

/**
 * 공연 데이터를 HTML태그로 생성합니다
 * @param {Date} selectedDate : 선택한 날짜
 * @param {String} selectedGenre : 선택한 장르
 * @param {String} selectedMap : 선택한 지역
 * @param {String} searchedQuery : 검색어
 * @param {Number} currentPage : 검색한 현재 페이지
 * @param {Number} maxPageCount : 한번 검색에 탐색 가능한 최대 페이지 수
 * @param {Number} totalMatchedPerformance : 현재 페이지에서 검색한 공연 총 개수
 * @param {Number} totalMatchedPerformanceLimit : 검색한 모든 페이지의 matchedPerformance 총 개수
 * @param {String} searchedType : 검색된 타입이 Submit 또는 more
 * @param {Object} fragment : 공연 검색 결과인 article태그(performanceArticle)를 저장하는 가상 요소
 * @returns
 */
async function performanceSearchResults(
  selectedDate,
  selectedGenre,
  selectedMap,
  searchedQuery,
  currentPage,
  maxPageCount,
  totalMatchedPerformance,
  totalMatchedPerformanceLimit,
  searchedType,
  fragment = document.createDocumentFragment()
) {
  const numOfRows = 100; // 한 페이지에 불러올 총 데이터 개수
  const jsonArray = []; // 필터링한 json data를 담을 변수 초기화
  let matchedPerformance = 0; // currentPage에서 검색 조건과 일치하는 공연 결과 개수

  /**
   * 공연의 시작 기간을 반환합니다
   * @param {Object} performanceData : 공연 정보
   * @returns {Date}
   */
  const periodStartDate = (performanceData) => new Date(performanceData.temporalCoverage.replaceAll(".", "-").split("~")[0]);

  // 공연 데이터를 가져옵니다
  let json = await performanceListAPI(numOfRows, currentPage);

  // 공연 데이터를 필터링 합니다
  for (let performance of json) {
    // 검색어가 있다면, 공연 제목 또는 공연 장소 중 검색어에 포함되어 있거나, 검색어가 없을 경우
    if (searchedQuery ? performance.title?.includes(searchedQuery) || performance.spatialCoverage?.includes(searchedQuery) : true) {
      // 선택한 장르가 일치하거나 전체일 경우
      if (selectedGenre === performance.subjectCategory || selectedGenre === "전체") {
        // 선택한 날짜가 공연 시작 날짜보다 큰 경우
        // 가져오는 api 공연 데이터가 2023년도 기준에 미치지 않기 때문에, 모든 공연 시작과 끝 날짜에 4년을 더합니다.
        if (selectedDate <= periodStartDate(performance).setFullYear(periodStartDate(performance).getFullYear() + 4)) {
          // 선택한 지역이 전국 이거나, 각 선택한 지역과 공연장이 위치하는 지역이 같다면 jsonArray에 performance를 넣습니다
          selectedMap === "전국" ||
          // 각 선택한 지역과 공연장이 위치하는 지역 대조
          (await new Promise((resolve) => {
            // 지도 키워드 검색을 위해, 장소 검색 객체를 생성합니다
            var places = new kakao.maps.services.Places();

            // 검색어, 검색결과, 문화시설 카테고리 옵션(, {category_group_code: "CT1",})
            // 검색어의 특수문자는 정규식을 통하여 공백 한칸으로 변경합니다
            places.keywordSearch(performance.spatialCoverage.replace(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=|"']/g, " ").replace(/\s+/g, " "), placesSearchCB);

            /**
             * 키워드 검색 완료 시 호출되는 콜백함수 입니다
             * @param {Array, Object} data : 검색 결과 데이터
             * @param {OK} status : 검색 성공 여부
             * @param {Object} pagination : 검색 페이지 데이터 (최대 45개 데이터)
             */
            function placesSearchCB(data, status, pagination) {
              if (status === kakao.maps.services.Status.OK) {
                // 검색한 공연장 지역을 선택한 지역과 대조 및 결과 반환
                resolve(data[0].address_name.substring(0, 2) === selectedMap);
              } else {
                // 임시 콘솔 출력
                // console.log(
                //   `#######################검색 실패#######################\n${performance.spatialCoverage
                //     .replace(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=|"']/g, " ")
                //     .replace(/\s+/g, " ")}\n-----------------------------------------------------`
                // );

                // 키워드 검색 실패의 경우 false를 반환합니다
                resolve(false);
              }
            }
          }))
            ? jsonArray.push(performance)
            : false;
        }
      }
    }
  }

  // 공연 데이터 HTML 생성
  jsonArray?.forEach((mp) => {
    // article태그 생성
    const performanceArticle = document.createElement("article");
    performanceArticle.setAttribute("id", "performanceArticle");

    // 공연 포스터 태그 변수
    let poster;
    // 공연 포스터 이미지가 있는 경우
    if (mp.referenceIdentifier.trim()) {
      // img태그 생성과 공연 포스터 속성 적용
      poster = document.createElement("img");
      poster.classList.add("posterImg");

      // 포스터가 없는 데이터의 경우 "  " 이렇게 표시 되기 때문에, trim() 이후 포스터가 없다면 no-img.jpg를 표시한다
      poster.src = mp.referenceIdentifier;
    }
    // 공연 포스터 이미지가 없는 경우 Icon으로 대체합니다
    else {
      poster = document.createElement("div");
      poster.classList.add("noImgDiv");

      const noImg = document.createElement("i");
      noImg.className = "fa-solid fa-image noImg";

      poster.appendChild(noImg);
    }

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
    venueA.href = `http://127.0.0.1:5500/venue-search.html?area=${selectedMap}&venue=${mp.spatialCoverage}`;
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
    // API 공연 데이터는 최신 데이터가 없어, 공연기간에 4년을 임의로 더하여 표현합니다
    periodSpan.innerHTML = mp.temporalCoverage.replace(/(2016|2017|2018|2019|2020|2021|2022)/g, (year) => parseInt(year) + 4);

    // output_section > artilce > img, a, a, span, span
    performanceArticle.appendChild(poster);
    performanceArticle.appendChild(titleA);
    performanceArticle.appendChild(venueA);
    performanceArticle.appendChild(genreSpan);
    performanceArticle.appendChild(periodSpan);

    matchedPerformance++; // 현재 페이지 공연 데이터 카운트
    totalMatchedPerformance++; // 전체 페이지 공연 데이터 카운트

    // 검색어가 있는 경우
    if (searchedQuery) {
      // submit검색과 검색 결과가 1개 발견한 경우
      if (searchedType === "submit" && totalMatchedPerformance === 1) {
        // skeleton screen이 있다면, 제거합니다
        document.getElementById("performance_search_results_skeleton")?.remove();

        // 더보기 버튼 활성화
        document.getElementById("more_btn").style.display = "block";
      }

      // 공연 검색 데이터를 performanceSection태그의 자식요소로 넣습니다
      document.getElementById("performanceSection").appendChild(performanceArticle);
    }
    // 검색어가 없는 경우
    else {
      // fragment에 공연 데이터 append
      fragment.appendChild(performanceArticle);
    }
  });

  console.log(`${currentPage}번째 페이지의 검색 결과, 일치하는 공연 데이터는 ${matchedPerformance}개 입니다.`);

  // 공연 결과 개수가 totalMatchedPerformanceLimit 이상인 경우,
  // 현재 페이지가 최대 검색 가능 페이지 이상인 경우 검색을 중단합니다
  if (totalMatchedPerformance >= totalMatchedPerformanceLimit || currentPage >= maxPageCount) {
    // 현재 페이지와 모든 공연 검색 결과 개수를 반환합니다
    return [currentPage, totalMatchedPerformance, fragment];
  }
  // 위 조건을 만족하지 않은 경우 재검색합니다
  else {
    // 다음 페이지를 검색합니다
    currentPage++;

    // 재귀함수
    return performanceSearchResults(
      selectedDate,
      selectedGenre,
      selectedMap,
      searchedQuery,
      currentPage,
      maxPageCount,
      totalMatchedPerformance,
      totalMatchedPerformanceLimit,
      searchedType,
      fragment
    );
  }
}

export default performanceSearchResults;
