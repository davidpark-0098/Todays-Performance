import { KAKAO_MAP_REST_API_KEY } from "./key.js";

/**
 * geolocation(좌표)을 사용하여, kakao map api로 현재 지역명을 반환합니다
 */
export default function coordToAddress() {
  // 브라우저가 Geolocation API를 지원하는지 확인
  if ("geolocation" in navigator) {
    return new Promise((resolve) => {
      // 위치 정보를 요청하고, 성공 또는 실패 시 콜백 함수 실행
      navigator.geolocation.getCurrentPosition(
        // 위치 정보를 성공적으로 가져온 경우 실행되는 콜백 함수
        async (position) => {
          try {
            // 좌표로 카카오맵 API에서 주소를 얻습니다
            const response = await axios.get(
              `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${position.coords.longitude}&y=${position.coords.latitude}`,
              {
                headers: { Authorization: `KakaoAK ${KAKAO_MAP_REST_API_KEY}` },
              }
            );

            // 지역 반환 ex: 서울, 경기
            resolve(response.data.documents[0].address.region_1depth_name);
          } catch (e) {
            // axios error
            console.error(
              `[Error Code] ${e.code}\n[Error Message] ${e.message}\n[HTTP Status] ${e.response.status}\n[HTTP Status Text] ${e.response.statusText}`
            );
            return;
          }
        },
        // 위치 정보를 가져오는 데 실패한 경우 실행되는 콜백 함수
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log("사용자가 위치 정보 요청을 거부했습니다.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.log("위치 정보를 사용할 수 없습니다.");
              break;
            case error.TIMEOUT:
              console.log("위치 정보 요청이 시간 초과되었습니다.");
              break;
            case error.UNKNOWN_ERROR:
              console.log("알 수 없는 오류가 발생했습니다.");
              break;
          }
        }
      );
    });
  } else {
    console.log("Geolocation을 지원하지 않는 브라우저입니다.");
    alert("Geolocation을 지원하지 않는 브라우저입니다.");
  }
}
