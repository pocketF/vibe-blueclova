import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { uploadVideoToCloudflare } from '../services/cloudflareStream';
import { saveVideoToFirebase, generatePassword } from '../services/firebaseService';
import './VideoUploader.css';

const VideoUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [videoId, setVideoId] = useState('');
  const [password, setPassword] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [error, setError] = useState('');
  const qrCodeRef = useRef(null);

  // 컴포넌트 마운트 시 환경 변수 확인
  useEffect(() => {
    const cloudflareAccountId = process.env.REACT_APP_CLOUDFLARE_ACCOUNT_ID;
    const cloudflareToken = process.env.REACT_APP_CLOUDFLARE_API_TOKEN;
    const firebaseApiKey = process.env.REACT_APP_FIREBASE_API_KEY;

    if (!cloudflareAccountId || !cloudflareToken) {
      console.warn('Cloudflare Stream API 설정이 누락되었습니다.');
    }
    if (!firebaseApiKey) {
      console.warn('Firebase 설정이 누락되었습니다.');
    }
  }, []);

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 비디오 파일인지 확인
      if (!file.type.startsWith('video/')) {
        setError('비디오 파일만 업로드 가능합니다.');
        return;
      }
      setSelectedFile(file);
      setError('');
      setUploadStatus('');
      setVideoId('');
      setPassword('');
    }
  };

  // 업로드 핸들러
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('파일을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadStatus('업로드 중...');
    setUploadProgress(0);

    try {
      // 1. 6자리 비밀번호 생성
      const generatedPassword = generatePassword();
      setPassword(generatedPassword);

      // 2. Cloudflare Stream에 업로드
      setUploadStatus('Cloudflare Stream에 업로드 중...');
      const uploadedVideoId = await uploadVideoToCloudflare(
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setVideoId(uploadedVideoId);
      setUploadStatus('Firebase에 저장 중...');

      // 3. Firebase에 비디오 ID와 비밀번호 저장
      let firebaseDocId = null;
      try {
        firebaseDocId = await saveVideoToFirebase(uploadedVideoId, generatedPassword);
        setDocumentId(firebaseDocId);
        console.log('Firebase 문서 ID:', firebaseDocId);
      } catch (firebaseError) {
        console.error('Firebase 저장 오류:', firebaseError);
        // Firebase 저장 실패해도 업로드는 완료된 것으로 처리
        // documentId 없이도 화면 업데이트
      }

      setUploadStatus('업로드 완료!');
      setUploadProgress(100);
      
      // 상태 업데이트 확인
      console.log('업로드 완료 상태:', {
        videoId: uploadedVideoId,
        password: generatedPassword,
        documentId: firebaseDocId,
        isUploading: false
      });
    } catch (err) {
      console.error('업로드 오류:', err);
      
      // 상세한 에러 메시지 표시
      let errorMessage = err.message || '업로드 중 오류가 발생했습니다.';
      
      // 환경 변수 관련 에러인 경우 추가 안내
      if (errorMessage.includes('설정이 누락') || errorMessage.includes('설정을 확인')) {
        errorMessage += '\n\n.env 파일에 다음 변수들이 설정되어 있는지 확인하세요:\n';
        errorMessage += '- REACT_APP_CLOUDFLARE_ACCOUNT_ID\n';
        errorMessage += '- REACT_APP_CLOUDFLARE_API_TOKEN\n';
        errorMessage += '- REACT_APP_FIREBASE_* (모든 Firebase 설정)';
      }
      
      setError(errorMessage);
      setUploadStatus('');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // QR 코드 이미지 다운로드
  const handleDownloadQR = () => {
    if (!qrCodeRef.current) return;

    const canvas = qrCodeRef.current.querySelector('canvas');
    if (!canvas) return;

    // Canvas를 이미지로 변환
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode-${documentId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  // 초기화
  const handleReset = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('');
    setVideoId('');
    setPassword('');
    setDocumentId('');
    setError('');
    setIsUploading(false);
    // 파일 input 초기화
    const fileInput = document.getElementById('video-file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // 뷰어 페이지 URL 생성
  const getViewerUrl = () => {
    if (!documentId) {
      // documentId가 없으면 videoId를 사용 (임시)
      return videoId ? `https://blueclova.com/view/${videoId}` : '';
    }
    return `https://blueclova.com/view/${documentId}`;
  };

  return (
    <div className="video-uploader-container">
      <div className="video-uploader-card">
        <h2 className="video-uploader-title">동영상 업로드</h2>

        {/* 파일 선택 */}
        <div className="file-select-area">
          <label htmlFor="video-file-input" className="file-label">
            <span className="file-icon">📹</span>
            <span className="file-text">
              {selectedFile ? selectedFile.name : '비디오 파일 선택'}
            </span>
          </label>
          <input
            id="video-file-input"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="file-input"
          />
        </div>

        {/* 선택된 파일 정보 */}
        {selectedFile && (
          <div className="file-info">
            <p><strong>파일명:</strong> {selectedFile.name}</p>
            <p><strong>크기:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>타입:</strong> {selectedFile.type}</p>
          </div>
        )}

        {/* 업로드 진행률 */}
        {isUploading && (
          <div className="progress-area">
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">{uploadProgress}%</p>
            <p className="status-text">{uploadStatus}</p>
          </div>
        )}

        {/* 업로드 완료 정보 */}
        {videoId && password && !isUploading && (
          <div className="success-area">
            <div className="success-icon">✅</div>
            <h3>업로드 완료!</h3>
            <div className="result-info">
              <div className="info-item">
                <strong>비디오 ID:</strong>
                <code>{videoId}</code>
              </div>
              <div className="info-item">
                <strong>비밀번호:</strong>
                <code className="password-code">{password}</code>
              </div>
              <div className="info-item">
                <strong>뷰어 URL:</strong>
                <code className="viewer-url">{getViewerUrl()}</code>
              </div>
            </div>
            
            {/* QR 코드 영역 - documentId가 있을 때만 표시 */}
            {documentId && getViewerUrl() && (
              <div className="qrcode-area" ref={qrCodeRef}>
                <h4 className="qrcode-title">QR 코드</h4>
                <div className="qrcode-container">
                  <QRCodeCanvas
                    value={getViewerUrl()}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <button
                  onClick={handleDownloadQR}
                  className="download-qr-button"
                >
                  📥 QR 코드 다운로드
                </button>
              </div>
            )}

            {!documentId && (
              <div className="warning-message">
                <p>⚠️ Firebase 저장에 실패했습니다. 비디오 ID는 저장되었지만 문서 ID를 가져올 수 없습니다.</p>
              </div>
            )}

            <p className="success-message">
              {documentId 
                ? '비디오가 Firebase에 성공적으로 저장되었습니다.'
                : '비디오 업로드는 완료되었습니다.'}
            </p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="error-area">
            <span className="error-icon">⚠️</span>
            <p className="error-text">{error}</p>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="button-area">
          {!videoId && (
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="upload-button"
            >
              {isUploading ? '업로드 중...' : '업로드하기'}
            </button>
          )}
          {videoId && (
            <button
              onClick={handleReset}
              className="reset-button"
            >
              새로 업로드
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;
