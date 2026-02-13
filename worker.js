/**
 * Cloudflare Worker - CORS 헤더 설정 포함
 * 
 * 이 파일을 Cloudflare Workers 대시보드에서 사용하세요.
 */

export default {
  async fetch(request, env, ctx) {
    // Origin 헤더 확인
    const origin = request.headers.get('Origin') || request.headers.get('origin');
    
    // CORS 헤더 설정 - 모든 Origin 허용 (개발용)
    // 프로덕션에서는 특정 도메인만 허용하도록 변경
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // 모든 도메인 허용
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'false',
      'Access-Control-Max-Age': '86400',
    };

    // OPTIONS 요청 처리 (preflight) - 가장 먼저 처리해야 함
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // POST 요청 처리
    if (request.method === 'POST') {
      try {
        // 요청 본문 파싱
        const body = await request.json();
        const { filename, filesize, filetype } = body;

        // Cloudflare Stream API에 업로드 URL 요청
        const accountId = env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = env.CLOUDFLARE_API_TOKEN;

        if (!accountId || !apiToken) {
          return new Response(
            JSON.stringify({ error: 'Cloudflare 설정이 누락되었습니다.' }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        // Cloudflare Stream API에 업로드 URL 요청
        const streamResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: filename,
              requireSignedURLs: false,
            }),
          }
        );

        if (!streamResponse.ok) {
          const errorData = await streamResponse.json();
          
          return new Response(
            JSON.stringify({
              error: '업로드 URL을 가져올 수 없습니다.',
              details: errorData,
            }),
            {
              status: streamResponse.status,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        const streamData = await streamResponse.json();
        
        // uploadURL과 uid 추출
        const uploadURL = streamData.result?.uploadURL;
        const uid = streamData.result?.uid || streamData.result?.id;

        if (!uploadURL || !uid) {
          return new Response(
            JSON.stringify({
              error: '업로드 URL 또는 UID를 받을 수 없습니다.',
              response: streamData,
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        // 클라이언트에 uploadURL과 uid 반환
        return new Response(
          JSON.stringify({
            uploadURL: uploadURL,
            uid: uid,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: '서버 오류가 발생했습니다.',
            message: error.message,
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // GET 요청 처리 (비디오 정보 조회 등)
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const path = url.pathname;

      // 비디오 정보 조회: /video/{uid}
      if (path.startsWith('/video/')) {
        const uid = path.split('/video/')[1];
        
        if (!uid) {
          return new Response(
            JSON.stringify({ error: '비디오 UID가 필요합니다.' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        try {
          const accountId = env.CLOUDFLARE_ACCOUNT_ID;
          const apiToken = env.CLOUDFLARE_API_TOKEN;

          const videoResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${uid}`,
            {
              headers: {
                'Authorization': `Bearer ${apiToken}`,
              },
            }
          );

          if (!videoResponse.ok) {
            return new Response(
              JSON.stringify({ error: '비디오 정보를 가져올 수 없습니다.' }),
              {
                status: videoResponse.status,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders,
                },
              }
            );
          }

          const videoData = await videoResponse.json();

          return new Response(
            JSON.stringify(videoData.result || videoData),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
      }

      // 기본 GET 응답
      return new Response(
        JSON.stringify({ message: 'Cloudflare Worker is running' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // 지원하지 않는 메서드
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  },
};
