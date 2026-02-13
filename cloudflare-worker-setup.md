# Cloudflare Worker 설정 가이드

## 1. Worker 코드 배포

1. Cloudflare Dashboard에 로그인
2. **Workers & Pages** 메뉴로 이동
3. **Create application** → **Create Worker** 클릭
4. `worker.js` 파일의 내용을 복사하여 Worker 편집기에 붙여넣기
5. **Save and deploy** 클릭

## 2. 환경 변수 설정

Worker 설정에서 다음 환경 변수를 추가하세요:

### Secrets (환경 변수)

1. **Workers & Pages** → 해당 Worker 선택
2. **Settings** → **Variables** 탭
3. **Add variable** 클릭하여 다음 변수 추가:

- **Variable name**: `CLOUDFLARE_ACCOUNT_ID`
  - **Value**: Cloudflare Account ID (예: `cd3bbfdad387eccfdb2cfff9370c6a3a`)

- **Variable name**: `CLOUDFLARE_API_TOKEN`
  - **Value**: Cloudflare API Token (Stream:Edit 권한 필요)

## 3. CORS 설정 커스터마이징

### 특정 도메인만 허용하기

모든 도메인(`*`) 대신 특정 도메인만 허용하려면:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000', // 개발 환경
  // 또는
  // 'Access-Control-Allow-Origin': 'https://blueclova.com', // 프로덕션
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

### 여러 도메인 허용하기

여러 도메인을 허용하려면 요청의 Origin을 확인하여 동적으로 설정:

```javascript
const origin = request.headers.get('Origin');
const allowedOrigins = [
  'http://localhost:3000',
  'https://blueclova.com',
  'https://www.blueclova.com',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

## 4. API 엔드포인트

### POST `/` - 업로드 URL 요청

**요청:**
```json
{
  "filename": "video.mp4",
  "filesize": 6766592,
  "filetype": "video/mp4"
}
```

**응답:**
```json
{
  "uploadURL": "https://...",
  "uid": "abc123..."
}
```

### GET `/video/{uid}` - 비디오 정보 조회

**응답:**
```json
{
  "uid": "abc123...",
  "status": "ready",
  ...
}
```

## 5. 테스트

Worker가 배포되면 다음 URL로 테스트할 수 있습니다:

```
https://blueclova-upload-proxy.seungyeon-lee.workers.dev/
```

## 6. 문제 해결

### CORS 오류가 계속 발생하는 경우

1. Worker 코드가 올바르게 배포되었는지 확인
2. OPTIONS 요청이 제대로 처리되는지 확인
3. 브라우저 개발자 도구의 Network 탭에서 응답 헤더 확인

### 환경 변수가 설정되지 않은 경우

Worker 로그에서 확인:
- Cloudflare Dashboard → Workers & Pages → 해당 Worker → **Logs** 탭

## 7. 보안 고려사항

- 프로덕션 환경에서는 `Access-Control-Allow-Origin: *` 대신 특정 도메인만 허용
- API Token은 환경 변수로 관리하고 절대 코드에 하드코딩하지 않기
- Rate limiting 고려 (필요시)
