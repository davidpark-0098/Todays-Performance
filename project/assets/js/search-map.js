import { KOPIS_KEY } from "./key.js";

function searchMap(map) {
  var Lat = 0; // 위도 |
  var Lng = 0; // 경도 -

  var doLat = 0; // 위도 |
  var doLng = 0; // 경도 -

  function buttonClick(value) {
    let locationS = value.split(",");
    Array.from(locationS);
    Lat = locationS[0];
    Lng = locationS[1];
    setCenter();
  }

  function buttonClickDo(valueDo) {
    let locationS = valueDo.split(",");
    Array.from(locationS);
    doLat = locationS[0];
    doLng = locationS[1];
    setCenterOut();
  }

  /**
   * 지도 이동시키기
   */
  // 시 지역 줌 레벨 7
  function setCenter() {
    // 이동할 위도 경도 위치를 생성합니다
    var moveLatLon = new kakao.maps.LatLng(Lat, Lng);
    // 지도 중심을 이동 시킵니다
    map.setCenter(moveLatLon);
    // 줌 레벨 설정
    zoomIn();
  }
  // 도 지역 줌 레벨 10
  function setCenterOut() {
    // 이동할 위도 경도 위치를 생성합니다
    var moveLatLon = new kakao.maps.LatLng(doLat, doLng);
    // 지도 중심을 이동 시킵니다
    map.setCenter(moveLatLon);
    // 줌 레벨 설정
    zoomOut();
  }

  /**
   * 공연 장소명을 중복없는 배열로 처리 후, search_map 함수 호출을 통해 지도에 표시
   */
  (async () => {
    let json = null;

    // 로딩창 띄우기
    document.querySelector("#loading").classList.add("active");

    try {
      /**/
      // test api json
      const response = await axios.get("http://localhost:3001/response");
      json = response.data.body.items.item;
      /*/
      // API JSON
      const response = await axios.get("http://api.kcisa.kr/openapi/service/rest/meta16/getkopis01", {
        params: {
          serviceKey: KOPIS_KEY,
          numOfRows: 100,
          pageNo: 1,
        },
        header: {
          accept: "application/json",
        },
      });

      json = response.data.response.body.items.item;
      /**/
    } catch (e) {
      console.error(e);
      alert("요청을 처리하는데 실패했습니다.");
      return;
    } finally {
      document.querySelector("#loading").classList.remove("active");
    }

    // 공연 데이터의 장소 이름을 배열로 생성하고 중복을 제거합니다.
    let placeNameArray = json.map((v) => v.spatialCoverage);
    placeNameArray = Array.from(new Set(placeNameArray));

    // 중복이 제거된 장소명을 search_map() 함수에 파라미터로 전송
    placeNameArray.forEach((v) => {
      search_map(v);
    });
  })();

  /**
   * 지도 표시
   */
  // 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
  var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

  var mapContainer = document.getElementById("map"), // 지도를 표시할 div
    mapOption = {
      center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
      level: 8, // 지도의 확대 레벨
    };

  // 지도를 생성합니다
  var map = new kakao.maps.Map(mapContainer, mapOption);

  /**
   * 지도 검색 및 마커 표시
   * placeNameArray에서 장소명을 파라미터로 지도에 검색 후 마커 표시
   */
  function search_map(queryKeyword) {
    // 장소 검색 객체를 생성합니다
    var places = new kakao.maps.services.Places();

    // 키워드로 장소를 검색합니다
    places.keywordSearch(queryKeyword, placesSearchCB);

    // 키워드 검색 완료 시 호출되는 콜백함수 입니다
    function placesSearchCB(data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        var bounds = new kakao.maps.LatLngBounds();

        for (var i = 0; i < data.length; i++) {
          displayMarker(data[0]);
          bounds.extend(new kakao.maps.LatLng(data[0].y, data[0].x));
        }

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
      }
    }

    // 지도에 마커를 표시하는 함수입니다
    function displayMarker(place) {
      // 마커를 생성하고 지도에 표시합니다
      var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x),
      });

      // 마커에 클릭이벤트를 등록합니다
      kakao.maps.event.addListener(marker, "click", function () {
        // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + "</div>");
        infowindow.open(map, marker);
      });
    }
  }

  /**
   * 지도 확대 수준
   */
  // 지도 레벨은 지도의 확대 수준을 의미합니다
  // 지도 레벨은 1부터 14레벨이 있으며 숫자가 작을수록 지도 확대 수준이 높습니다
  function zoomIn() {
    // 현재 지도의 레벨을 얻어옵니다
    var level = map.getLevel();

    // 지도를 1레벨 내립니다 (지도가 확대됩니다)
    map.setLevel(7);
  }

  function zoomOut() {
    // 현재 지도의 레벨을 얻어옵니다
    var level = map.getLevel();

    // 지도를 1레벨 올립니다 (지도가 축소됩니다)
    map.setLevel(10);
  }

  /**
   * 지도 확대, 축소 가능 여부
   */
  // 버튼 클릭에 따라 지도 확대, 축소 기능을 막거나 풀고 싶은 경우에는 map.setZoomable 함수를 사용합니다
  function setZoomable(zoomable) {
    // 마우스 휠로 지도 확대,축소 가능여부를 설정합니다
    map.setZoomable(zoomable);
  }
}

export default searchMap;
