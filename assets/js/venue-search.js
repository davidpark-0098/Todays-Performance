// 좌표를 사용하여 현재 지역명 반환
import coordToAddress from "./coordToAddress.js";
// 카카오맵 api 공연장 찾기
import searchVenueKakaoMap from "./kakao-map-venue-search.js";
// 로딩 loading("start"), loading("end")
import loading from "./loading.js";

// search performance 공연 검색 결과에서 선택한 공연장을 파라미터로 전달 받습니다
const urlParams = new URLSearchParams(window.location.search);
const area = urlParams?.get("area");
const venue = urlParams?.get("venue");

// 파라미터가 있을 경우 해당 공연장을 검색합니다
if (area && venue) {
  // 해당 지역을 selecte_map 항목에 설정합니다
  document.getElementById("select_map").value = area;
  // 선택한 공연장 이름을 input에 설정합니다
  document.getElementById("input_search_query").value = venue;

  // 장소 검색
  searchVenueKakaoMap(area, venue, "urlParams");
}

// location button 클릭 이벤트
document.getElementById("location_btn").addEventListener("click", () => {
  // 좌표를 사용하여 현재 지역명 반환
  coordToAddress()
    .then((area) => {
      // 현재 위치로 지역 옵션 선택
      document.getElementById("select_map").value = area;
    })
    .catch((e) => {
      console.error(e);
      alert(e);
    });
});

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
    document.getElementById("select_map").focus();
  } else {
    // 로딩 시작
    loading("start");
    // 예외처리를 통과하면, 검색을 시작합니다.
    // 검색 후 지도 및 마커를 표시 합니다.
    searchVenueKakaoMap(selectedMap, searchedQuery);
  }
});
