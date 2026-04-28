# KindCare (유치원 통합 관리)

React(Vite) 프론트엔드 + Spring Boot 백엔드로 구성된 모노레포입니다.

## 구조

```
kindcare/
├── kindcare-web/    # 프론트엔드 (React 19 + Vite + Tailwind)
└── kindcare-api/    # 백엔드 (Spring Boot 3.x + JWT + JPA + H2)
```

## 필요 환경

- **JDK 17+**
- **Node.js 20+** (LTS 권장)
- **Maven** (또는 `kindcare-api`의 `mvnw` 사용)

## 백엔드 실행

```powershell
cd kindcare-api
.\mvnw.cmd spring-boot:run
```

- 기본 API URL: `http://localhost:8081` (`application.yml` 의 `server.port` 확인)
- H2 파일 DB는 `kindcare-api/data/` 에 생성됩니다. (저장소에 올라가지 않도록 `.gitignore` 처리함)

## 프론트엔드 실행

```powershell
cd kindcare-web
npm install
npm run dev
```

- 개발 서버 프록시: `vite.config.js` 에서 `/api` → 백엔드 포트로 전달합니다. 포트가 맞지 않으면 수정하세요.

## 이력서·포트폴리오

이 저장소 하나에 **프론트·백엔드 코드가 함께** 있어, 한 링크로 전체를 설명하면 됩니다.

## 보안 참고

`application.yml` 의 JWT 등은 **실서비스 전에 반드시 환경 변수나 별도 설정으로 교체**하세요. 학습용·포트폴리오 레포에서는 placeholder를 두는 편을 권장합니다.
