// 로딩 loading("start"), loading("end")
import loading from "./loading.js";

/**
 * 지역과 검색어를 통해 카카오맵 API를 활용하여 지도와 마커를 표시합니다
 * @param {String} selectedMap : 지역 이름
 * @param {String} searchedQuery : 검색어
 */
function kakaoMapVenueSearch(selectedMap, searchedQuery, urlParams) {
  // 지도가 중첩되어 생성되는 것을 방지하기 위해 기존에 생성한 지도는 삭제합니다
  document.getElementById("map").innerHTML = "";

  // 지역: [위도, 경도, 확대 레벨]
  const areaCoordinate = {
    전국: [35.907757, 127.766922, 13],
    서울: [37.5518911, 126.9917937, 8],
    부산: [35.2100142, 129.0688702, 8],
    대구: [35.8294374, 128.5655119, 8],
    인천: [37.4562557, 126.7052062, 9],
    광주: [35.1557358, 126.8354271, 8],
    대전: [36.3398175, 127.3940486, 8],
    울산: [35.5537228, 129.2380554, 8],
    세종: [36.5606976, 127.2587334, 8],
    경기: [37.5289145, 127.1727772, 10],
    강원: [37.724962, 128.3009629, 10],
    충북: [36.7378449, 127.8305242, 10],
    충남: [36.5296003, 126.8590621, 10],
    전북: [35.7197198, 127.1243977, 10],
    전남: [34.9402001, 126.9565003, 10],
    경북: [36.3436011, 128.7401566, 10],
    경남: [35.369563, 128.2570135, 10],
    제주: [33.3846216, 126.5534925, 9],
  };
  // 선택한 지역에 따라 map의 좌표와 확대 레벨을 초기화 합니다
  const [selectedMapLat, selectedMapLng, selectedMapZoomLevel] = areaCoordinate[selectedMap];

  /**
   * 지도 표시
   */
  var mapContainer = document.getElementById("map"), // 지도를 표시할 div
    mapOption = {
      center: new kakao.maps.LatLng(selectedMapLat, selectedMapLng), // 지도의 중심좌표
      // 지도 레벨은 지도의 확대 수준을 의미합니다
      // 지도 레벨은 1부터 14레벨이 있으며 숫자가 작을수록 지도 확대 수준이 높습니다
      // 선택한 지역의 시, 도에 따라 확대 단계를 다르게 적용합니다
      level: selectedMapZoomLevel,
    };

  // 지도를 생성합니다
  var map = new kakao.maps.Map(mapContainer, mapOption);

  /**
   * 지도에 컨트롤 올리기
   */
  // 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
  var mapTypeControl = new kakao.maps.MapTypeControl();

  // 지도에 컨트롤을 추가해야 지도위에 표시됩니다
  // kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
  map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

  // 지도 확대 축소를 제어할 수 있는 줌 컨트롤을 생성합니다
  var zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  /**
   * 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
   */
  var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

  // 전국 검색시, 검색에 성공한 지역의 개수를 측정합니다
  let searchCount = 0;
  // 전국 검색시, 검색에 실패한 지역의 개수를 측정합니다
  let searchFailureCount = 0;

  // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
  // LatLngBounds 객체에 좌표를 추가합니다
  var bounds = new kakao.maps.LatLngBounds();

  // 키워드 검색 조건에 맞는 검색어 생성
  // urlParams가 있는 경우, 공연장 키워드를 넣지 않습니다
  const keyword = urlParams ? searchedQuery : searchedQuery ? `${searchedQuery} 공연장` : `공연장`;

  // 선택한 지역이 전국인 경우
  if (selectedMap === "전국") {
    // "전국"을 제외한 나머지 지역을 담은 배열 생성
    Object.keys(areaCoordinate)
      .slice(1)
      // 각 지역 검색 반복
      .forEach((area) => {
        keywordSearch(`${area} ${keyword}`);
      });
  }
  // 선택한 지역이 전국이 아닌 경우
  else {
    // 선택한 지역 검색
    keywordSearch(`${selectedMap} ${keyword}`);
  }

  /**
   * 지도 키워드 검색
   * @param {String} keyword : 조건에 맞춰 생성된 검색어
   */
  function keywordSearch(keyword) {
    // 장소 검색 객체를 생성합니다
    var places = new kakao.maps.services.Places();

    // 검색어, 검색결과, 문화시설 카테고리 옵션(, {category_group_code: "CT1",})
    // 검색어의 특수문자는 정규식을 통하여 공백 한칸으로 변경합니다
    places.keywordSearch(keyword.replace(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=|"']/g, " ").replace(/\s+/g, " "), placesSearchCB);

    /**
     * 키워드 검색 완료 시 호출되는 콜백함수 입니다
     * @param {Array, Object} data : 검색 결과 데이터
     * @param {OK} status : 검색 성공 여부
     * @param {Object} pagination : 검색 페이지 데이터 최대 45개 데이터
     */
    function placesSearchCB(data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        // 선택한 지역이 전국인 경우
        if (selectedMap === "전국") {
          data.forEach((v, i) => {
            // 마커를 표시합니다
            displayMarker(v);
            // bounds의 범위를
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
          });

          // 다음 페이지가 있으면 다음 페이지를 검색합니다
          if (pagination.hasNextPage) {
            pagination.nextPage();
          } else {
            // 검색 성공 카운트
            searchCount++;
          }
          // 검색 결과가 있는 경우, 마지막 결과에서 지도의 범위 결정
          if (searchCount + searchFailureCount === 17) {
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
            map.setBounds(bounds);
            // 로딩 중단
            loading("end");
          }
        }
        // 선택한 지역이 전국이 아닌 경우
        else {
          // searchedQeury의 검색 결과가 여러개일 경우
          // 모든 결과 중, 선택한 장소와 카테고리 그룹 코드가 일치하는 장소를 마커로 표시합니다
          data.forEach((v) => displayMarker(v));
          // 다음 페이지가 있으면 다음 페이지를 검색합니다
          if (pagination.hasNextPage) {
            pagination.nextPage();
          } else {
            // 로딩 중단
            loading("end");
          }
        }
      }
      // 검색 실패의 경우
      else {
        // 선택한 지역이 전국인 경우
        if (selectedMap === "전국") {
          // 검색 실패 카운트
          searchFailureCount++;
          // 모두 검색 실패한 경우
          if (searchFailureCount === 17) {
            // 로딩 중단
            loading("end");
            alert("검색 결과가 없습니다.");
          }
          // 모든 검색 결과, 검색을 성공한 지역이 1개 이상일 경우
          else if (searchCount + searchFailureCount === 17) {
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
            map.setBounds(bounds);
            // 로딩 중단
            loading("end");
          }
        }
        // 선택한 지역의 검색 실패의 경우
        else {
          // 로딩 중단
          loading("end");
          alert("검색 결과가 없습니다.");
        }
      }
    }
  }

  /**
   * 지도에 마커를 표시하는 함수입니다
   * @param {Object} place : 검색결과인 data 중 한개의 data입니다
   */
  function displayMarker(place) {
    // 마커를 생성하고 지도에 표시합니다
    var marker = new kakao.maps.Marker({
      map: map,
      position: new kakao.maps.LatLng(place.y, place.x),
    });

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, "click", function () {
      // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
      infowindow.setContent(
        '<div class="markerDiv">' +
          `<a class="markerLink" href=${place.place_url} target="_blank" rel="noreferrer">` +
          '<span class="markerTitle">' +
          place.place_name +
          "</span>" +
          "</a>" +
          "</div>"
      );
      infowindow.open(map, marker);
    });
  }

  /**
   * 지도 정보 얻어오기
   */
  (function mapInfo() {
    // 지도의 현재 중심좌표를 얻어옵니다
    var center = map.getCenter();

    // 지도의 현재 레벨을 얻어옵니다
    var level = map.getLevel();

    // 지도타입을 얻어옵니다
    var mapTypeId = map.getMapTypeId();

    // 지도의 현재 영역을 얻어옵니다
    var bounds = map.getBounds();

    // 영역의 남서쪽 좌표를 얻어옵니다
    var swLatLng = bounds.getSouthWest();

    // 영역의 북동쪽 좌표를 얻어옵니다
    var neLatLng = bounds.getNorthEast();

    // 영역정보를 문자열로 얻어옵니다. ((남,서), (북,동)) 형식입니다
    var boundsStr = bounds.toString();

    var message = "지도 중심좌표는 위도 " + center.getLat() + ", <br>";
    message += "경도 " + center.getLng() + " 이고 <br>";
    message += "지도 레벨은 " + level + " 입니다 <br> <br>";
    message += "지도 타입은 " + mapTypeId + " 이고 <br> ";
    message += "지도의 남서쪽 좌표는 " + swLatLng.getLat() + ", " + swLatLng.getLng() + " 이고 <br>";
    message += "북동쪽 좌표는 " + neLatLng.getLat() + ", " + neLatLng.getLng() + " 입니다";

    // 개발자도구를 통해 직접 message 내용을 확인해 보세요.
    console.log(message);
  })();
}

export default kakaoMapVenueSearch;
