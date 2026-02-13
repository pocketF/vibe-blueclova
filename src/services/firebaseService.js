import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * 6자리 랜덤 비밀번호 생성
 * @returns {string} - 6자리 숫자 비밀번호
 */
export const generatePassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Firebase에 비디오 정보 저장
 * @param {string} videoId - Cloudflare Stream 비디오 ID
 * @param {string} password - 6자리 비밀번호
 * @returns {Promise<string>} - 저장된 문서 ID
 */
export const saveVideoToFirebase = async (videoId, password) => {
  try {
    const docRef = await addDoc(collection(db, 'videos'), {
      videoId: videoId,
      password: password,
      createdAt: serverTimestamp(),
      status: 'active'
    });

    return docRef.id;
  } catch (error) {
    console.error('Firebase 저장 오류:', error);
    throw error;
  }
};
