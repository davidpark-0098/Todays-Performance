// 공연 검색
import searchPerformanceOutput from "./search-performance-output.js";

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
  // 입력한 검색어의 공백을 제거한 값
  const searchedQuery = formData.get("searchQuery").trim();

  // 임시 콘솔 출력
  console.log(selectedDate, selectedGenre, searchedQuery);

  // 장르, 지도 값 검사
  if (selectedGenre === null) {
    alert("장르를 선택해 주세요.");
  } else {
    // 예외처리를 통과하면, 검색을 시작합니다.
    searchPerformanceOutput(new Date(selectedDate), selectedGenre, searchedQuery);

    // 검색 결과가 없다면, 검색 결과 메시지를 출력합니다.
    setTimeout(() => {
      if (document.querySelector(".row_container").children.length == 0) {
        document.querySelector("#loading").classList.remove("active"); // 로딩 중단
        document.querySelector("#title2").innerHTML = "<a href='#top' id='text_link'>검색 결과가 없습니다.</a>";
      }
    }, 5000);
  }
});
