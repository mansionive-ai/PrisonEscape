// 게임 설정 — site/index.html 과 author/build.mjs 가 같이 사용합니다.
export const GAME = {
  titleImage: "assets/title.jpg",
  warning: "이 미궁은 욕설, 공포와 불쾌한 요소가 포함되어 있습니다.",

  // Firebase 콘솔 → 프로젝트 설정 → 내 앱(웹) 에서 복사
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    appId: "YOUR_APP_ID",
  },

  // 아무 문자열로 한 번 바꿔두세요. 바꾸면 build 를 다시 해서 DB에 다시 올려야 합니다.
  salt: "change-me-to-any-random-text",
  iterations: 150000,       // 높을수록 무차별 대입이 느려짐
  saveKey: "escape-save-v1",
};

// 정답 비교 규칙: 띄어쓰기 무시, 대소문자 무시
export function normalizeAnswer(s) {
  return String(s ?? "").normalize("NFC").replace(/\s+/g, "").toLowerCase();
}
