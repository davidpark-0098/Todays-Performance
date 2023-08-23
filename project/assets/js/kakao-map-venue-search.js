/**
 * 지역과 검색어를 통해 카카오맵 API를 활용하여 지도와 마커를 표시합니다
 * @param {String} selectedMap : 지역 이름
 * @param {String} searchedQuery : 검색어
 */
function kakaoMapVenueSearch(selectedMap, searchedQuery) {
  // 지도가 중첩되어 생성되는 것을 방지하기 위해 기존에 생성한 지도는 삭제합니다
  document.getElementById("map").innerHTML = "";

  // 지역: [위도, 경도, 확대 레벨]
  const areaCoordinate = {
    // 공연장은 search-performance 페이지에서 선택한 공연장으로, map의 초기화를 위해, 임시로 전국 좌표와 확대 레벨을 지정했습니다
    공연장: [35.907757, 127.766922, 13],
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

  /**
   * 키워드 검색 조건에 맞는 검색어 생성
   */
  // 지역이 공연장일 경우
  if (selectedMap === "공연장") {
    // 공연검색 페이지의 공연 결과에서, 공연장을 눌렀을 때, 전국 지역으로 해당 공연장을 검색합니다
    keywordSearch(searchedQuery);

    // 지역이 전국이며 검색어가 없는 경우
  } else if (selectedMap === "전국" && !searchedQuery) {
    for (let area in areaCoordinate) {
      keywordSearch(area !== "공연장" || area !== "전국" ? area + " " + "공연장" : false);
    }

    // searchedQuery의 검색어가 있는 경우와 없는 경우에 따라, 검색어 또는 공연장으로 장소를 검색합니다
    // 지역이 전국이며 검색어가 있는 경우
  } else if (selectedMap === "전국" && searchedQuery) {
    keywordSearch(searchedQuery + " " + "공연장");

    // 지역과 검색어가 있는 경우
  } else if (selectedMap && searchedQuery) {
    keywordSearch(selectedMap + " " + searchedQuery + " " + "공연장");

    // 지역이 있고 검색어가 없는 경우
  } else if (selectedMap && !searchedQuery) {
    keywordSearch(selectedMap + " " + "공연장");
  }

  /**
   * 지도 키워드 검색
   * @param {String} keyword : 조건에 맞춰 생성된 검색어
   */
  function keywordSearch(keyword) {
    // 장소 검색 객체를 생성합니다
    var places = new kakao.maps.services.Places();

    // 검색어, 검색결과, 옵션
    places.keywordSearch(keyword, placesSearchCB, { category_group_code: "CT1" });
  }

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
      // 지역이 전국 또는 각 지역에 따라 다르게 필터링합니다
      if (selectedMap === "공연장") {
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        var bounds = new kakao.maps.LatLngBounds();

        data.forEach((v, i) => {
          // 마커를 표시합니다
          displayMarker(v);
          // bounds의 범위를
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        });
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);

        // 검색 직후 지역 선택에, 검색 결과의 지역을 설정합니다
        const select = document.getElementById("select_map");
        const option = select.querySelector(`[value=${data[0].address_name.substring(0, 2)}]`);
        if (option) select.selectedIndex = option.index;
      } else {
        // searchedQeury의 검색 결과가 여러개일 경우
        // 모든 결과 중, 선택한 장소와 카테고리 그룹 코드가 일치하는 장소를 마커로 표시합니다
        data.forEach((v) => {
          displayMarker(v);
        });
        // 다음 페이지가 있으면 다음 페이지를 검색합니다
        if (pagination.hasNextPage) pagination.nextPage();
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

export default kakaoMapVenueSearch;
