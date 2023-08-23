// 공연 검색
import performanceSearchResults from "./performance-search-results.js";
import loading from "./loading.js";

// 날짜 기본 값을 오늘로 지정
document.querySelector("#input_date").valueAsDate = new Date();

// 변수 선언
let selectedDate, selectedGenre, searchedQuery, currentPage, maxPageCount, totalMatchedPerformance, totalMatchedPerformanceLimit;

/**
 * form에서 submit 이벤트 발생 시, 선택한 각각의 옵션 값을 변수에 할당합니다.
 * performanceSearch() 함수를 실행합니다.
 */
document.getElementById("search_form").addEventListener("submit", (e) => {
  e.preventDefault(); // form 기본 기능 제어
  const formData = new FormData(e.target); // form 데이터 캡처

  // FormData 객체를 사용하여 폼 데이터 접근
  // 선택한 날짜 값
  selectedDate = formData.get("date");
  // 선택한 장르 값
  selectedGenre = formData.get("genre");
  // 입력한 검색어의 공백을 제거한 값
  searchedQuery = formData.get("searchQuery").trim();
  // 첫번째 페이지
  currentPage = 1;
  // 최대 검색 가능한 페이지 개수
  maxPageCount = 10;
  // 검색한 총 공연의 개수
  totalMatchedPerformance = 0;
  // 최대 검색 가능한 공연 개수
  totalMatchedPerformanceLimit = 10;

  // 장르 선택 확인
  if (selectedGenre === null || selectedGenre === undefined) {
    alert("장르를 선택해 주세요.");
  } else {
    // 로딩 시작
    loading("start");

    // 예외처리를 통과하면, 검색을 시작합니다
    performanceSearch();
  }
});

/**
 * 더보기 클릭시, 기존 검색 데이터를 가지고 performanceSearch()를 실행합니다
 */
document.getElementById("more_btn").addEventListener("click", () => {
  // 로딩 시작
  loading("start");
  console.log(new Date(selectedDate), selectedGenre, searchedQuery, currentPage, maxPageCount, totalMatchedPerformance, totalMatchedPerformanceLimit);
  performanceSearch();
});

/**
 * 공연을 검색하고 변수 값을 업데이트합니다
 */
async function performanceSearch() {
  // 검색을 시작합니다
  // performanceSearchResults()는 재귀함수이기 때문에, 함수가 모두 완료되고 결과를 반환받습니다
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
