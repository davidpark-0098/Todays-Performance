// 공연장 지도 및 마커 표시
import searchVenueKakaoMap from "./search-venue-kakao-map.js";

// search performance 공연 검색 결과에서 선택한 공연장을 파라미터로 전달 받습니다
const urlParams = new URLSearchParams(window.location.search);
// 파라미터가 있을 경우 해당 공연장을 검색합니다
if (urlParams.get("venue")) {
  // 선택한 공연장 이름을 input에 설정합니다
  document.getElementById("input_search_query").value = urlParams.get("venue");
  searchVenueKakaoMap("공연장", urlParams.get("venue"));
}

/**
 * form의 submit 이벤트 발생 시, 선택한 각각의 옵션 값을 변수에 할당합니다.
 * searchVenueKakaoMap() 함수를 실행합니다.
 */
document.getElementById("search_form").addEventListener("submit", (e) => {
  e.preventDefault(); // form 기본 동작 제어

  const formData = new FormData(e.target); // 폼 데이터 캡처

  // FormData 객체를 사용하여 폼 데이터 접근
  // 선택한 지역 값을 반환합니다
  const selectedMap = formData.get("map");
  // 입력한 검색어의 공백을 제거한 값을 반환합니다
  const searchedQuery = formData.get("searchQuery").trim();

  // 지역 값 검사
  if (selectedMap === undefined || selectedMap === null) {
    alert("지역을 선택해 주세요.");
  } else {
    // 예외처리를 통과하면, 검색을 시작합니다.
    // 검색 후 지도 및 마커를 표시 합니다.
    searchVenueKakaoMap(selectedMap, searchedQuery);
  }
});
