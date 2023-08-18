// 공연 검색
import performanceSearchResults from "./performance-search-results.js";

// 날짜 기본 값을 오늘로 지정
document.querySelector("#input_date").valueAsDate = new Date();

let selectedDate = null;
let selectedGenre = "";
let searchedQuery = "";
let currentPage = 1;
let maxPageCount = 10;
let totalMatchedPerformance = 0;
let totalMatchedPerformanceLimit = 10;

/**
 * form의 submit 이벤트 발생 시, 선택한 각각의 옵션 값을 변수에 할당합니다.
 * performanceSearchResults() 함수를 실행합니다.
 */
document.getElementById("search_form").addEventListener("submit", (submitEvent) => {
  submitEvent.preventDefault(); // form 기본 기능 제어
  searchs(submitEvent);
});

/**
 * 더보기 클릭시, 기존 검색 데이터를 가지고 performanceSearchResults()를 실행합니다
 */
document.getElementById("more_btn").addEventListener("click", (clickEvent) => {
  searchs(clickEvent.isTrusted);
});

async function searchs(event) {
  if (event === true) {
    // 로딩 시작
    document.querySelector("#loading").classList.add("active");
    console.log(new Date(selectedDate), selectedGenre, searchedQuery, currentPage, maxPageCount, totalMatchedPerformance, totalMatchedPerformanceLimit);
    // 검색을 시작합니다
    let [returnCurrentPage, returnTotalMatchedPerformance] = await performanceSearchResults(
      new Date(selectedDate),
      selectedGenre,
      searchedQuery,
      currentPage,
      maxPageCount,
      totalMatchedPerformance,
      totalMatchedPerformanceLimit
    );
    currentPage = returnCurrentPage + 1;
    maxPageCount = currentPage + 9;
    totalMatchedPerformance = returnTotalMatchedPerformance;
    totalMatchedPerformanceLimit = totalMatchedPerformance + 10;
  } else {
    const formData = new FormData(event.target); // form 데이터 캡처

    // FormData 객체를 사용하여 폼 데이터 접근
    // 선택한 날짜 값
    selectedDate = formData.get("date");
    // 선택한 장르 값
    selectedGenre = formData.get("genre");
    // 입력한 검색어의 공백을 제거한 값
    searchedQuery = formData.get("searchQuery").trim();

    // 장르, 지도 값 검사
    if (selectedGenre === null) {
      alert("장르를 선택해 주세요.");
    } else {
      // 기존 검색 결과 내용을 삭제합니다
      document.getElementById("performance_search_results").innerHTML = "";
      // 로딩 시작
      document.querySelector("#loading").classList.add("active");
      // 예외처리를 통과하면, 검색을 시작합니다
      let [returnCurrentPage, returnTotalMatchedPerformance] = await performanceSearchResults(
        new Date(selectedDate),
        selectedGenre,
        searchedQuery,
        currentPage,
        maxPageCount,
        totalMatchedPerformance,
        totalMatchedPerformanceLimit
      );
      currentPage = returnCurrentPage + 1;
      maxPageCount = currentPage + 9;
      totalMatchedPerformance = returnTotalMatchedPerformance;
      totalMatchedPerformanceLimit = totalMatchedPerformance + 10;
    }
  }
}

