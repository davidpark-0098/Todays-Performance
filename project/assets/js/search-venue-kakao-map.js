// selectedMap은 확대단계 | 위도 | 경도 | 지역 을 나타냅니다
function searchVenueKaKaoMap([selectedMapZoomLevel, selectedMapLat, selectedMapLng, selectedMapAria], searchedQuery) {
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

  /**
   * 지도 검색 및 마커 표시
   * placeNameArray에서 장소명을 파라미터로 지도에 검색 후 마커 표시
   */
  // 검색어가 있는 경우와 없는 경우에 따라, 검색어 또는 공연장으로 장소를 검색합니다
  // 장소 검색 객체를 생성합니다
  var places = new kakao.maps.services.Places(map);
  // 키워드로 장소를 검색합니다
  // searchedQeury 검색어가 없는 경우 공연장으로 검색합니다
  // useMapBouds를 사용하면, places의 map에 지정된 좌표 중심을 기준으로 검색합니다
  places.keywordSearch(searchedQuery || "공연장", placesSearchCB, { useMapBounds: true });

  /**
   * 키워드 검색 완료 시 호출되는 콜백함수 입니다
   * @param {Array, Object} data : 검색 결과 데이터
   * @param {OK} status : 검색 성공 여부
   * @param {Object} pagination : 검색 페이지 데이터 최대 45개 데이터
   */
  function placesSearchCB(data, status, pagination) {
    /**
     * 아래는 data 중 하나의 예시 입니다
     * address_name: "서울 영등포구 여의도동 12";
     * category_group_code: "CT1";
     * category_group_name: "문화시설";
     * category_name: "문화,예술 > 문화시설 > 공연장,연극극장";
     * distance: "";
     * id: "8005993";
     * phone: "02-6181-5260";
     * place_name: "영산아트홀";
     * place_url: "http://place.map.kakao.com/8005993";
     * road_address_name: "서울 영등포구 여의공원로 101";
     * x: "126.924946840511";
     * y: "37.5294739059123";
     */

    if (status === kakao.maps.services.Status.OK) {
      // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
      // LatLngBounds 객체에 좌표를 추가합니다
      // var bounds = new kakao.maps.LatLngBounds();
      // bounds.extend(new kakao.maps.LatLng(data[0].y, data[0].x));
      // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
      // map.setBounds(bounds);

      // searchedQeury의 검색 결과가 여러개일 경우
      // 모든 결과 중, 선택한 장소와 카테고리 그룹 코드가 일치하는 장소를 마커로 표시합니다
      data.forEach((v) => v.address_name.substring(0, 2) === selectedMapAria && v.category_group_code === "CT1" && displayMarker(v));

      // 다음 페이지가 있으면 다음 페이지를 검색합니다
      if (pagination.hasNextPage) pagination.nextPage();
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
}

export default searchVenueKaKaoMap;
