// 검색 결과 출력
import searchResults from "./search-results.js";
// 지도 및 마커 표시
import searchMap from "./search-map.js";

// variable
let currentPage = 1; // 현재 페이지
let count = 0; // 검색한 결과의 개수

// 날짜 기본 값을 오늘로 지정
document.querySelector("#input_date").valueAsDate = new Date();

/**
 * form의 submit 이벤트 발생 시, 선택한 각각의 옵션 값을 변수에 할당합니다.
 * search() 함수를 실행합니다.
 */
document.getElementById("search_form").addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(e.target); // 폼 데이터 캡처

  // FormData 객체를 사용하여 폼 데이터 접근
  // 선택한 날짜 값
  const selectedDate = formData.get("date");
  // 선택한 장르 값
  const selectedGenre = formData.get("genre");
  // 선택한 지도 값
  const selectedMap = formData.get("map");
  // 선택한 검색 타입 값
  const searchedType = formData.get("searchType");
  // 입력한 검색어의 공백을 제거한 값
  const searchedQuery = formData.get("searchQuery").trim();

  // 임시 콘솔 출력
  console.log(selectedDate, selectedGenre, selectedMap, searchedType, searchedQuery);

  // 장르, 지도 값 검사
  if (selectedGenre === null) {
    alert("장르를 선택해 주세요.");
  } else if (selectedMap === null) {
    alert("지역을 선택해 주세요.");
  } else {
    // 예외처리를 통과하면, 검색을 시작합니다.
    // searchResults 함수는 search-results.js 파일의 함수입니다.
    searchResults(new Date(selectedDate), selectedGenre, searchedType, searchedQuery, count, currentPage);
    // 검색 후 지도에 마커를 표시 합니다.
    // searchMap();

    // 검색 결과가 없다면, 검색 결과 메시지를 출력합니다.
    setTimeout(() => {
      if (document.querySelector(".row_container").children.length == 0) {
        document.querySelector("#loading").classList.remove("active"); // 로딩 중단
        document.querySelector("#title2").innerHTML = "<a href='#top' id='text_link'>검색 결과가 없습니다.</a>";
      }
    }, 5000);
  }
});
