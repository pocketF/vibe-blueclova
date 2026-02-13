# Blue Clova - React 프로젝트

Cloudflare Stream API를 사용하여 비디오를 업로드하고, Firebase에 비디오 ID와 비밀번호를 저장하는 리액트 애플리케이션입니다.

## 프로젝트 구조

```
blue_clova/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── VideoUploader.jsx      # 비디오 업로드 컴포넌트
│   │   └── VideoUploader.css      # 컴포넌트 스타일
│   ├── config/
│   │   └── firebase.js            # Firebase 설정
│   ├── services/
│   │   ├── cloudflareStream.js    # Cloudflare Stream API 서비스
│   │   └── firebaseService.js     # Firebase 서비스
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── .env.example
```

## 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 다음 정보를 입력하세요:

```env
# Firebase 설정
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Cloudflare Stream 설정
REACT_APP_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
REACT_APP_CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

#### Firebase 설정 방법

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 설정 > 일반 탭에서 웹 앱 추가
4. Firebase SDK 설정 정보 복사하여 `.env` 파일에 입력
5. Firestore Database 생성 (테스트 모드 또는 프로덕션 모드)

#### Cloudflare Stream 설정 방법

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인
2. Stream 메뉴로 이동
3. API 토큰 생성:
   - Account ID 확인
   - API Tokens 메뉴에서 새 토큰 생성
   - Stream:Edit 권한 부여
4. 생성된 토큰과 Account ID를 `.env` 파일에 입력

### 3. 애플리케이션 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하면 비디오 업로드 페이지가 표시됩니다.

## 주요 기능

### 1. 비디오 파일 업로드
- 드래그 앤 드롭 또는 클릭으로 비디오 파일 선택
- 업로드 진행률 실시간 표시
- Cloudflare Stream API를 통한 안전한 업로드

### 2. 자동 비밀번호 생성
- 6자리 랜덤 숫자 비밀번호 자동 생성
- 각 업로드마다 고유한 비밀번호 할당

### 3. Firebase 저장
- 업로드 완료 후 자동으로 Firebase Firestore에 저장
- 저장 정보:
  - `videoId`: Cloudflare Stream 비디오 ID
  - `password`: 6자리 비밀번호
  - `createdAt`: 생성 시간 (서버 타임스탬프)
  - `status`: 상태 (기본값: 'active')

## Firebase 데이터 구조

Firestore의 `videos` 컬렉션에 다음과 같은 구조로 저장됩니다:

```javascript
{
  videoId: "string",        // Cloudflare Stream 비디오 ID
  password: "string",        // 6자리 비밀번호
  createdAt: Timestamp,     // 생성 시간
  status: "active"          // 상태
}
```

## 컴포넌트 사용법

### VideoUploader 컴포넌트

```jsx
import VideoUploader from './components/VideoUploader';

function App() {
  return <VideoUploader />;
}
```

## API 서비스

### Cloudflare Stream API

`src/services/cloudflareStream.js`

- `uploadVideoToCloudflare(videoFile, onProgress)`: 비디오 업로드
- `getVideoInfo(videoId)`: 비디오 정보 조회

### Firebase Service

`src/services/firebaseService.js`

- `generatePassword()`: 6자리 비밀번호 생성
- `saveVideoToFirebase(videoId, password)`: Firebase에 비디오 정보 저장

## 빌드

프로덕션 빌드:

```bash
npm run build
```

빌드된 파일은 `build/` 폴더에 생성됩니다.

## 문제 해결

### Firebase 연결 오류
- `.env` 파일의 Firebase 설정값이 올바른지 확인
- Firebase 프로젝트에서 Firestore Database가 활성화되어 있는지 확인

### Cloudflare Stream 업로드 오류
- `.env` 파일의 Cloudflare 설정값이 올바른지 확인
- API 토큰에 Stream:Edit 권한이 있는지 확인
- Account ID가 올바른지 확인

### CORS 오류
- Cloudflare Stream API는 CORS를 지원하지만, 브라우저에서 직접 호출 시 제한이 있을 수 있습니다.
- 필요시 프록시 서버를 사용하거나 백엔드 API를 통해 업로드하세요.

## 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.
