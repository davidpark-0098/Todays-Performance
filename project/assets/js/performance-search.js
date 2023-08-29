// 공연 검색
import performanceSearchResults from "./performance-search-results.js";
// 로딩 loading("start"), loading("end")
import loading from "./loading.js";

// 날짜 기본 값을 오늘로 지정
document.querySelector("#input_date").valueAsDate = new Date();

// 변수 선언
let selectedDate, selectedGenre, selectedMap, searchedQuery, currentPage, maxPageCount, totalMatchedPerformance, totalMatchedPerformanceLimit, searchedType;
// node를 포함할 배열 초기화
let fragment = [];

/**
 * 공연 검색 결과인 fragment를 performanceSection태그에 append합니다
 */
function fragmentAppend() {
  // fragment 생성
  let fragmentChild = document.createDocumentFragment();
  // 공연 데이터 append
  fragment.splice(0, 10).forEach((v) => fragmentChild.appendChild(v));
  // 공연 결과 append
  document.getElementById("performanceSection").appendChild(fragmentChild);
}

/**
 * 검색 타입에 따라, 결과 출력 방식을 다르게 합니다
 * @param {String} searchedType : 검색 타입이 submit 또는 more
 */
function resultsAppend(searchedType) {
  // submit 검색의 경우
  if (searchedType === "submit") {
    // skeleton screen이 있다면, 제거합니다
    document.getElementById("performance_search_results_skeleton")?.remove();
    // 기존 검색 결과 내용을 삭제합니다
    document.getElementById("performanceSection").innerHTML = "";

    fragmentAppend();
  }
  // more 검색의 경우
  else if (searchedType === "more") {
    // no_results_div가 있다면, 제거합니다
    document.getElementById("no_results_div")?.remove();

    fragmentAppend();
  }
}

/**
 * 첫 검색시, 선택한 각각의 옵션 값을 변수에 할당하고 performanceSearch()를 실행합니다
 */
document.getElementById("search_form").addEventListener("submit", (e) => {
  e.preventDefault(); // 기본 기능 제어

  // FormData 객체를 사용하여 폼 데이터 접근
  const formData = new FormData(e.target); // form 데이터 캡처
  // 선택한 날짜 값
  selectedDate = formData.get("date");
  // 선택한 장르 값
  selectedGenre = formData.get("genre");
  // 선택한 지역 값
  selectedMap = formData.get("map");
  // 입력한 검색어의 공백을 제거한 값
  searchedQuery = formData.get("searchQuery").trim();
  // 첫번째 페이지
  currentPage = 1;
  // 최대 검색 가능한 페이지 개수
  maxPageCount = 30;
  // 검색한 총 공연의 개수
  totalMatchedPerformance = 0;
  // 최대 검색 가능한 공연 개수
  totalMatchedPerformanceLimit = 10;
  // 검색된 타입이 Submit일 경우
  searchedType = "submit";

  // 장르 및 지역 선택 확인
  if (selectedGenre === null || selectedGenre === undefined) {
    alert("장르를 선택해 주세요.");
    document.getElementById("select_genre").focus();
  } else if (selectedMap === null || selectedMap === undefined) {
    alert("지역을 선택해 주세요.");
    document.getElementById("select_map").focus();
  } else {
    // 더보기 버튼 비활성화
    document.getElementById("more_btn").disabled = true;
    // 검색 버튼 비활성화
    document.getElementById("submit_btn").disabled = true;
    // 로딩 시작
    loading("start");

    // 검색어가 있고 없고 차이에 따라, 공연 검색 결과를 출력하는 방식이 다릅니다
    // 검색어가 있는 경우, sumit과 동시에 기존 검색 결과 내용을 삭제합니다
    searchedQuery && (document.getElementById("performanceSection").innerHTML = "");

    // 검색을 시작합니다
    performanceSearch();
  }
});

/**
 * 더보기 클릭시, 기존 검색 데이터를 가지고 검색합니다
 */
document.getElementById("more_btn").addEventListener("click", () => {
  // fragment가 가진 공연 데이터가 10개 이상일 경우
  if (fragment.length >= 10) {
    fragmentAppend();
  }
  // fragment가 가진 공연 데이터가 10개 미만인 경우
  else {
    // 검색된 타입이 더보기일 경우
    searchedType = "more";

    // 더보기 버튼 비활성화
    document.getElementById("more_btn").disabled = true;
    // 검색 버튼 비활성화
    document.getElementById("submit_btn").disabled = true;
    // 로딩 시작
    loading("start");

    // 임시 콘솔 출력
    console.log(`날짜: ${new Date(
      selectedDate
    )}, 장르: ${selectedGenre}, 지역: ${selectedMap}, 검색어: ${searchedQuery}, 현재 페이지: ${currentPage}, 최대 검색 가능한 페이지: ${maxPageCount}, 누적 공연 데이터 개수: ${totalMatchedPerformance}, 최대 누적 가능 공연 데이터 개수: ${totalMatchedPerformanceLimit}, 검색 타입: ${searchedType}
  `);

    performanceSearch();
  }
});

/**
 * 공연을 검색하고 변수 값을 업데이트합니다
 */
async function performanceSearch() {
  // 검색을 시작합니다
  // performanceSearchResults()는 재귀함수이기 때문에, 함수가 모두 완료되고 결과를 반환받습니다
  let [returnCurrentPage, returnTotalMatchedPerformance, returnFragment] = await performanceSearchResults(
    new Date(selectedDate),
    selectedGenre,
    selectedMap,
    searchedQuery,
    currentPage,
    maxPageCount,
    totalMatchedPerformance,
    totalMatchedPerformanceLimit,
    searchedType
  );

  // 반환받은 값을 통해 기존 변수값을 업데이트합니다
  currentPage = returnCurrentPage + 1; // 다음 검색할 페이지 할당
  maxPageCount = currentPage + 29; // 현재 페이지부터 앞으로 검색 가능한 최대 페이지 수 할당
  totalMatchedPerformance = returnTotalMatchedPerformance; // 공연 검색결과 개수 할당
  totalMatchedPerformanceLimit = totalMatchedPerformance + 10; // 최대 공연 검색결과 개수 할당

  // 반환받은 fragment를 배열 fragment에 push
  fragment.push(...returnFragment.childNodes);

  // 검색어가 없는 검색 결과
  !searchedQuery && resultsAppend(searchedType);

  // 로딩 중단
  loading("end");
  // 검색 버튼 활성화
  document.getElementById("submit_btn").disabled = false;
  // 더보기 버튼 활성화
  document.getElementById("more_btn").disabled = false;
  document.getElementById("more_btn").style.display = "block";

  // 임시 콘솔 출력
  console.log(`검색 결과, 합계 공연 데이터는 ${totalMatchedPerformance}개 입니다.`);

  // 검색 결과가 없다면, 메시지를 출력합니다.
  if (totalMatchedPerformance === 0) {
    // skeleton screen이 있다면, 제거합니다
    document.getElementById("performance_search_results_skeleton")?.remove();
    document.getElementById("performanceSection").innerHTML = "<div id='no_results_div'><a href='#' id='no_results_a'>검색 결과가 없습니다.</a></div>";

    // 검색 결과 메시지 클릭 이벤트
    document.getElementById("no_results_a").addEventListener("click", (e) => {
      e.preventDefault(); // 기본 기능 제어

      const input = document.getElementById("input_search_query");
      // 검색어 입력란 값을 비우고 포커스
      input.value = "";
      input.focus();
    });
  }
}
