// 공연장 지도 및 마커 표시
import searchVenueKakaoMap from "./search-venue-kakao-map.js";

/**
 * form의 submit 이벤트 발생 시, 선택한 각각의 옵션 값을 변수에 할당합니다.
 * search() 함수를 실행합니다.
 */
document.getElementById("search_form").addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(e.target); // 폼 데이터 캡처

  // FormData 객체를 사용하여 폼 데이터 접근
  // 선택한 지도 값
  const selectedMap = formData.get("map");
  // 입력한 검색어의 공백을 제거한 값
  const searchedQuery = formData.get("searchQuery").trim();

  // 임시 콘솔 출력
  console.log(selectedMap, searchedQuery);

  // 지역 값 검사
  if (selectedMap === null) {
    alert("지역을 선택해 주세요.");
  } else {
    // 예외처리를 통과하면, 검색을 시작합니다.
    // 검색 후 지도 및 마커를 표시 합니다.
    searchVenueKakaoMap(selectedMap, searchedQuery);
  }
});