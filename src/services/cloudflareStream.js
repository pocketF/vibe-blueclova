import axios from 'axios';

// Cloudflare Worker 주소
//const CLOUDFLARE_WORKER_URL = 'https://blueclova-upload-proxy.seungyeon-lee.workers.dev';

const CLOUDFLARE_WORKER_URL = 'https://blueclova-upload-proxy.seungyeon-lee.workers.dev';

/**
 * Cloudflare Stream API로 비디오 업로드 (Worker를 통해)
 * @param {File} videoFile - 업로드할 비디오 파일
 * @param {Function} onProgress - 업로드 진행률 콜백 함수 (0-100)
 * @returns {Promise<string>} - 업로드된 비디오의 UID
 */
export const uploadVideoToCloudflare = async (videoFile, onProgress) => {
  try {
    console.log('=== Cloudflare Worker를 통한 업로드 시작 ===');
    console.log('파일명:', videoFile.name);
    console.log('파일 크기:', (videoFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('파일 타입:', videoFile.type);

    // 1단계: Worker에 POST 요청하여 uploadURL과 uid 받기
    if (onProgress) {
      onProgress(5); // 초기 진행률
    }

    console.log('1단계: Worker에서 uploadURL 요청 중...');
    console.log('Worker URL:', CLOUDFLARE_WORKER_URL);
    
    const uploadUrlResponse = await axios.post(
      CLOUDFLARE_WORKER_URL,
      {
        filename: videoFile.name,
        filesize: videoFile.size,
        filetype: videoFile.type
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000, // 30초 타임아웃
        withCredentials: false // CORS 요청 시 필요
      }
    );

    console.log('Worker 응답:', uploadUrlResponse.data);

    if (!uploadUrlResponse.data) {
      throw new Error('Worker에서 uploadURL을 받을 수 없습니다.');
    }

    const { uploadURL, uid } = uploadUrlResponse.data;

    if (!uploadURL || !uid) {
      throw new Error('Worker 응답에 uploadURL 또는 uid가 없습니다.');
    }

    console.log('업로드 URL 받음:', uploadURL);
    console.log('비디오 UID:', uid);

    if (onProgress) {
      onProgress(10); // uploadURL 받기 완료
    }

    // 2단계: 받은 uploadURL로 실제 비디오 파일 업로드
    console.log('2단계: 비디오 파일 업로드 중...');
    
    // FormData 생성
    const formData = new FormData();
    formData.append('file', videoFile);

    // TUS 또는 POST 방식으로 업로드
    // uploadURL이 TUS 프로토콜을 사용하는지 확인
    const isTusUpload = uploadURL.includes('/tus/') || uploadURL.includes('tus');
    
    if (isTusUpload) {
      // TUS 프로토콜 사용 (향후 구현 가능)
      console.log('TUS 프로토콜 감지됨 (현재는 POST 방식 사용)');
    }

    // POST 방식으로 업로드
    const uploadResponse = await axios.post(
      uploadURL,
      formData,
      {
        headers: {
          // FormData 사용 시 Content-Type은 자동 설정됨
        },
        timeout: 300000, // 5분 타임아웃 (대용량 파일 대비)
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            // 10% ~ 95% 범위에서 진행률 표시
            const uploadProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            const totalProgress = 10 + Math.floor((uploadProgress * 85) / 100);
            onProgress(totalProgress);
          }
        }
      }
    );

    console.log('업로드 완료 응답:', uploadResponse.status, uploadResponse.statusText);

    if (onProgress) {
      onProgress(100); // 업로드 완료
    }

    console.log('업로드 완료! 비디오 UID:', uid);
    return uid;

  } catch (error) {
    console.error('=== Cloudflare Worker 업로드 오류 ===');
    console.error('에러 객체:', error);
    console.error('에러 메시지:', error.message);
    console.error('에러 코드:', error.code);
    
    if (error.response) {
      // 서버 응답이 있는 경우
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error('응답 상태:', status);
      console.error('응답 데이터:', errorData);
      
      let errorMessage = '업로드 중 오류가 발생했습니다.';
      
      if (status === 404) {
        errorMessage = 'Worker 엔드포인트를 찾을 수 없습니다.';
      } else if (status === 401) {
        errorMessage = '인증 실패: Worker 인증이 필요합니다.';
      } else if (status === 413) {
        errorMessage = '파일 크기 초과: 업로드할 파일이 너무 큽니다.';
      } else if (status === 429) {
        errorMessage = '요청 한도 초과: 너무 많은 요청이 발생했습니다. 잠시 후 다시 시도하세요.';
      } else if (errorData?.error || errorData?.message) {
        errorMessage = errorData.error || errorData.message || errorMessage;
      } else {
        errorMessage = `업로드 실패 (${status}): ${errorData?.message || errorMessage}`;
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 오류)
      console.error('요청 정보:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      });
      
      let errorMessage = '네트워크 오류: Worker에 연결할 수 없습니다.\n\n';
      
      // CORS 오류 확인
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage += '⚠️ CORS 오류가 발생했습니다.\n\n';
        errorMessage += 'Cloudflare Worker에서 CORS 헤더를 설정해야 합니다.\n';
        errorMessage += 'Worker 코드에 다음 헤더를 추가하세요:\n\n';
        errorMessage += 'Access-Control-Allow-Origin: *\n';
        errorMessage += 'Access-Control-Allow-Methods: POST, OPTIONS\n';
        errorMessage += 'Access-Control-Allow-Headers: Content-Type\n\n';
      errorMessage += '또는 특정 도메인만 허용하려면:\n';
      errorMessage += 'Access-Control-Allow-Origin: https://blueclova.com\n';
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage += '요청 시간이 초과되었습니다. 파일 크기가 너무 크거나 네트워크가 느릴 수 있습니다.';
      } else {
        errorMessage += `오류 코드: ${error.code || '알 수 없음'}`;
      }
      
      throw new Error(errorMessage);
    } else {
      // 요청 설정 중 오류
      throw new Error(error.message || '알 수 없는 오류가 발생했습니다.');
    }
  }
};

/**
 * Cloudflare Stream 비디오 정보 가져오기
 * @param {string} videoId - 비디오 ID (UID)
 * @returns {Promise<Object>} - 비디오 정보
 */
export const getVideoInfo = async (videoId) => {
  try {
    // Worker를 통해 비디오 정보 조회 (필요시 구현)
    const response = await axios.get(
      `${CLOUDFLARE_WORKER_URL}/video/${videoId}`,
      {
        timeout: 10000
      }
    );

    return response.data;
  } catch (error) {
    console.error('비디오 정보 가져오기 오류:', error);
    if (error.response) {
      throw new Error(
        error.response.data?.error || 
        error.response.data?.message ||
        `비디오 정보 조회 실패: ${error.response.status}`
      );
    }
    throw error;
  }
};
