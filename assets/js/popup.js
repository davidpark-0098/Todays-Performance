/**
 * 팝업 쿠키 여부를 확인하고 팝업을 표시합니다
 */
(async function popup() {
  // 쿠키 이름을 기준으로 정규식을 사용하여 값을 가져옵니다
  var popupCookie = document.cookie.match("(^|;) ?" + "close_popup" + "=([^;]*)(;|$)");
  // 쿠키가 있다면, 쿠키값을 가져옵니다
  var popupCookieValue = popupCookie ? popupCookie[2] : false;

  // 쿠키 여부를 확인합니다
  if (!popupCookieValue) {
    // "data-popup" 속성을 갖는 요소
    const div = document.querySelector("[data-popup]");

    try {
      // "data-popup" 속성 값으로, html 파일의 소스코드를 가져옵니다
      const response = await axios.get(div.dataset.popup); // "./inc/popup.html"

      // 요소를 html 파일의 소스코드로 교체합니다
      div.outerHTML = response.data;
    } catch (e) {
      console.error(e);
    } finally {
      // 팝업의 X 버튼 클릭 이벤트 처리
      document.getElementById("close_popup")?.addEventListener("click", () => {
        document.getElementById("popup_wrapper").classList.add("closePopup");
      });

      // 팝업의 오늘 하루 보지 않기 버튼 클릭 이벤트
      document.getElementById("today_close_popup")?.addEventListener("click", () => {
        document.getElementById("popup_wrapper").classList.add("closePopup");

        // 하루동안 쿠키를 적용합니다
        const expires = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `close_popup=true; expires=${expires}; path=/`;
      });
    }
  }
})();
