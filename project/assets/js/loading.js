export default function loading(startEnd) {
  if (startEnd === "start") {
    // 검색 버튼 아이콘 제거
    document.querySelector("#search_icon").classList.remove("active");
    // 검색 버튼에서 로딩 시작
    document.querySelector("#loading_icon_on_submit_btn").classList.add("active");
  } else if (startEnd === "end") {
    // 검색 버튼에서 로딩 종료
    document.querySelector("#loading_icon_on_submit_btn").classList.remove("active");
    // 검색 버튼 아이콘 추가
    document.querySelector("#search_icon").classList.add("active");
  }
}
