# Blue Clova - Video Upload System

Cloudflare Stream API를 사용하여 비디오를 업로드하고, Firebase에 비디오 ID와 비밀번호를 저장하는 시스템입니다.

## 주요 기능

- ✅ Cloudflare Stream을 통한 비디오 업로드
- ✅ Firebase Firestore에 비디오 정보 저장
- ✅ 6자리 비밀번호 자동 생성
- ✅ QR 코드 생성 및 다운로드
- ✅ 카페24 상품 상세페이지 통합

## 프로젝트 구조

```
blue_clova/
├── src/
│   ├── components/
│   │   ├── VideoUploader.jsx      # 비디오 업로드 컴포넌트
│   │   └── VideoUploader.css
│   ├── services/
│   │   ├── cloudflareStream.js    # Cloudflare Stream API 서비스
│   │   └── firebaseService.js     # Firebase 서비스
│   ├── config/
│   │   └── firebase.js            # Firebase 설정
│   └── App.js                     # React Router 설정
├── public/
│   ├── index.html
│   ├── _redirects                 # Netlify 리다이렉트
│   └── .htaccess                  # Apache 리다이렉트
├── worker.js                      # Cloudflare Worker 코드
└── package.json
```

## 설치 및 실행

### 개발 환경

```bash
npm install
npm start
```

개발 서버가 `http://localhost:3000/video_upload`에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `build/` 폴더에 생성됩니다.

## 배포

### URL 경로

- 개발: `http://localhost:3000/video_upload`
- 프로덕션: `https://blueclova.com/video_upload`

### 배포 방법

자세한 배포 방법은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

## 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Firebase 설정
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Cloudflare Stream 설정
REACT_APP_CLOUDFLARE_ACCOUNT_ID=your_account_id
REACT_APP_CLOUDFLARE_API_TOKEN=your_api_token
```

## Cloudflare Worker 설정

`worker.js` 파일을 Cloudflare Workers에 배포하고, 다음 환경 변수를 설정하세요:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

자세한 설정 방법은 [cloudflare-worker-setup.md](./cloudflare-worker-setup.md)를 참조하세요.

## 카페24 통합

카페24 상품 상세페이지에 동영상 메시지 버튼을 추가하려면 `cafe24_integration.html` 파일을 참조하세요.

## 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.
