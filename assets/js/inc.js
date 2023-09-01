// 쿠키 이름을 기준으로 정규식을 사용하여 값을 가져옵니다
var popupCookie = document.cookie.match("(^|;) ?" + "close_popup" + "=([^;]*)(;|$)");
// 쿠키가 있다면, 쿠키값을 가져옵니다
var popupCookieValue = popupCookie ? popupCookie[2] : false;

// "data-include" 속성을 갖는 모든 요소에 대한 탐색
Array.from(document.querySelectorAll("*[data-include]")).forEach(async (v) => {
  // ex: data-include="./inc/header.html"
  const html = v.dataset.include;

  try {
    // html이 팝업일 경우, 쿠키 여부에 따라 실행한다
    if (!(html.includes("popup") && popupCookieValue)) {
      // ./inc/header.html 파일의 소스코드를 가져옵니다
      const response = await axios.get(html);

      // v를 html의 소스코드로 교체합니다
      v.outerHTML = response.data;
    }
  } catch (e) {
    console.error(e);
  }
});
