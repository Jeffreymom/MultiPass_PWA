MultiPass PWA 완성본

■ GitHub Pages 업로드
1. 이 압축을 풉니다.
2. MultiPass_PWA 폴더 안의 파일들을 새 GitHub 저장소 최상위에 업로드합니다.
3. 저장소 Settings → Pages로 이동합니다.
4. Deploy from a branch를 선택합니다.
5. Branch는 main, 폴더는 /(root)로 선택하고 Save를 누릅니다.
6. 생성된 GitHub Pages 주소를 휴대폰에서 엽니다.

■ 휴대폰 설치
Android Chrome
- 주소 접속 → 화면의 '앱 설치' 버튼
- 버튼이 보이지 않으면 오른쪽 위 ⋮ → 앱 설치 또는 홈 화면에 추가

iPhone Safari
- 주소 접속 → 공유 버튼 → 홈 화면에 추가
- iPhone에서는 화면의 앱 설치 버튼이 표시되지 않을 수 있습니다.

■ 오프라인 사용
- GitHub Pages 주소에 인터넷이 연결된 상태로 한 번 접속합니다.
- 페이지가 완전히 열린 뒤 홈 화면에 추가합니다.
- 그다음부터는 인터넷이 없어도 앱과 전체 문제 데이터가 열립니다.
- 오답노트, 즐겨찾기, 응시 기록은 해당 휴대폰 브라우저에 저장됩니다.
- 브라우저 데이터나 사이트 데이터를 삭제하면 학습 기록도 삭제됩니다.

■ 포함 파일
index.html
style.css
app.js
data.js
manifest.json
service-worker.js
icons/
.nojekyll
404.html

주의
- service worker는 보안상 file://로 연 index.html에서는 동작하지 않습니다.
- PWA 오프라인 기능은 GitHub Pages 같은 HTTPS 주소에서 확인해야 합니다.
