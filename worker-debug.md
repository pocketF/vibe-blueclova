# Cloudflare Worker CORS 디버깅 가이드

## CORS 오류가 계속 발생하는 경우

### 1. Worker 배포 확인

1. Cloudflare Dashboard → **Workers & Pages** → 해당 Worker 선택
2. **Deployments** 탭에서 최신 배포가 있는지 확인
3. **Quick Edit** 또는 **Edit code**로 코드가 올바르게 저장되었는지 확인

### 2. Worker 로그 확인

1. **Workers & Pages** → 해당 Worker → **Logs** 탭
2. 다음 로그가 보이는지 확인:
   - "요청 Origin: http://localhost:3000"
   - "요청 Method: OPTIONS" 또는 "요청 Method: POST"
   - "OPTIONS 요청 처리 (preflight)"

### 3. 브라우저에서 직접 테스트

브라우저 콘솔에서 다음 명령어로 테스트:

```javascript
// OPTIONS 요청 테스트
fetch('https://blueclova-upload-proxy.seungyeon-lee.workers.dev/', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type',
  }
}).then(r => {
  console.log('Status:', r.status);
  console.log('Headers:', [...r.headers.entries()]);
});

// POST 요청 테스트
fetch('https://blueclova-upload-proxy.seungyeon-lee.workers.dev/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:3000',
  },
  body: JSON.stringify({
    filename: 'test.mp4',
    filesize: 1000,
    filetype: 'video/mp4'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

### 4. Network 탭에서 확인

1. 브라우저 개발자 도구(F12) → **Network** 탭
2. 요청을 다시 시도
3. OPTIONS 요청과 POST 요청 모두 확인
4. 각 요청의 **Response Headers**에서 다음 헤더 확인:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`

### 5. Worker 코드 재배포

1. `worker.js` 파일의 최신 내용을 복사
2. Cloudflare Dashboard → Worker 편집기
3. 전체 코드를 새로 붙여넣기
4. **Save and deploy** 클릭
5. 배포 완료 후 몇 초 대기 (캐시 문제일 수 있음)

### 6. 캐시 문제 해결

Worker가 배포되었지만 이전 버전이 캐시되어 있을 수 있습니다:

1. 브라우저 캐시 삭제 (Ctrl + Shift + Delete)
2. 하드 리프레시 (Ctrl + Shift + R)
3. 시크릿 모드에서 테스트

### 7. Worker URL 확인

Worker URL이 올바른지 확인:
- 현재 URL: `https://blueclova-upload-proxy.seungyeon-lee.workers.dev/`
- 마지막 슬래시(`/`)가 있는지 확인

### 8. 환경 변수 확인

Worker 설정에서 환경 변수가 올바르게 설정되었는지 확인:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

## 예상되는 정상 응답

### OPTIONS 요청 응답
```
Status: 204 No Content
Headers:
  Access-Control-Allow-Origin: http://localhost:3000
  Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT
  Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
  Access-Control-Max-Age: 86400
```

### POST 요청 응답
```
Status: 200 OK
Headers:
  Access-Control-Allow-Origin: http://localhost:3000
  Content-Type: application/json
Body:
  {
    "uploadURL": "https://...",
    "uid": "abc123..."
  }
```

## 문제가 계속되면

1. Worker 로그의 전체 내용 확인
2. Network 탭의 요청/응답 헤더 스크린샷
3. Worker 코드가 실제로 배포되었는지 확인
