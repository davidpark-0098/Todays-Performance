// 모든 DOM Tree가 구성되었다면, 콜백함수가 실행됩니다
document.addEventListener("DOMContentLoaded", function () {
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
});
