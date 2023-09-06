// "data-include" 속성을 갖는 모든 요소에 대한 탐색
Array.from(document.querySelectorAll("[data-include]")).forEach(async (v) => {
  try {
    // "data-include" 속성 값으로, html 파일의 소스코드를 가져옵니다
    const response = await axios.get(v.dataset.include); // ex: "./inc/header.html"

    // 요소를 html 파일의 소스코드로 교체합니다
    v.outerHTML = response.data;
  } catch (e) {
    console.error(e);
  }
});
