# KindCare

[![CI](https://github.com/hin22/kindcare/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/hin22/kindcare/actions/workflows/ci.yml)

유치원/어린이집 업무를 가정한 웹 애플리케이션입니다.  
교사·학부모 역할, JWT 인증, 원생·초대코드, 알림장, 대시보드, 달력(행사·특이사항) 등을 포함합니다.

| | |
|---|---|
| Frontend | React 19, Vite, Tailwind |
| Backend | Spring Boot 3, JPA, H2, JWT |

`kindcare-web/` · `kindcare-api/` 모노레포입니다.

개발 시 **Cursor IDE + Claude 모델**을 활용해 코드를 작성·정리했습니다.

## CI (자동 빌드)

GitHub에 코드를 올리면 **백엔드·프론트 빌드가 자동**으로 실행됩니다.  
방법: 저장소 **Actions** 탭을 열어 보시면 됩니다. 초록색이면 성공입니다.

1. 로컬에서 `git push` 한 번 하기  
2. 브라우저에서 `https://github.com/hin22/kindcare` → **Actions** 클릭  
3. 맨 위 **CI** 줄을 눌러 로그 확인  

위 배지가 회색이면 아직 한 번도 안 돌았거나, `ci.yml`이 GitHub에 없는 상태일 수 있습니다. `main`에 푸시하면 곧 갱신됩니다.

## 실행 (로컬 개발)

백엔드 (`http://localhost:8081` 등, `application.yml` 참고):

```powershell
cd kindcare-api
.\mvnw.cmd spring-boot:run
```

프론트엔드:

```powershell
cd kindcare-web
npm install
npm run dev
```

실서비스 배포 전 `application.yml` 의 비밀(JWT 등)은 반드시 별도 보관·교체해야 합니다.
