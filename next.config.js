/** @type {import('next').NextConfig} */
const nextConfig = {
  crossOrigin: 'anonymous',
  // 폐쇄망 빌드 최적화: 외부 요청 차단 및 빌드 실패 방지
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Standalone 모드: 도커 컨테이너 환경 최적화 (필수 파일만 복사하여 실행 가능)
  // output: 'standalone',
  // SWC 컴파일러 바이너리 문제 회피 (필요 시 주석 해제)
  // swcMinify: false,
};

module.exports = nextConfig;
