import webpack from "webpack";

const mode = process.env.BUILD_MODE ?? "standalone";
console.log("[Next] build mode", mode);

const disableChunk = !!process.env.DISABLE_CHUNK || mode === "export";
console.log("[Next] build with chunk: ", !disableChunk);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    if (disableChunk) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      );
    }

    config.resolve.fallback = {
      child_process: false,
    };

    return config;
  },
  output: mode,
  images: {
    unoptimized: mode === "export",
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

if (mode !== "export") {
  nextConfig.headers = async () => {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "*",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
    ];
  };

  nextConfig.rewrites = async () => {
    const BestUrl = process.env.NEXT_PUBLIC_REACT_APP_BASE_URL;
    const BestModelUrl = process.env.NEXT_PUBLIC_REACT_APP_MODEL_BASE_URL;
    const ret = [
      {
        source: "/api/proxy/:path*",
        destination: "https://api.openai.com/:path*",
      },
      {
        source: "/sharegpt",
        destination: "https://sharegpt.com/api/conversations",
      },
      {
        source: "/api/latestNews",
        destination: `${BestUrl}/api/announcement`,
      },
      {
        source: "/api/login",
        destination: `${BestUrl}/api/login`,
      },
      {
        source: "/api/user",
        destination: `${BestUrl}/api/user`,
      },
      {
        source: "/api/register",
        destination: `${BestUrl}/api/register`,
      },
      {
        source: "/api/changePassword",
        destination: `${BestUrl}/api/changePassword`,
      },
      {
        source: "/api/invitationRecords",
        destination: `${BestUrl}/api/invitationRecords`,
      },
      {
        source: "/api/sendCode",
        destination: `${BestUrl}/api/sendCode`,
      },
      {
        source: "/api/sendResetPasswordCode",
        destination: `${BestUrl}/api/sendResetPasswordCode`,
      },
      {
        source: "/api/forgotPassword",
        destination: `${BestUrl}/api/forgotPassword`,
      },
      {
        source: "/api/captcha",
        destination: `${BestUrl}/api/captcha`,
      },
      {
        source: "/api/module/generateAMindMap",
        destination: `${BestModelUrl}/api/module/generateAMindMap`,
      },
    ];

    const apiUrl = process.env.API_URL;
    if (apiUrl) {
      console.log("[Next] using api url ", apiUrl);
      ret.push({
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      });
    }

    return {
      beforeFiles: ret,
    };
  };
}

export default nextConfig;
