import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const DynamicCameraComponent = dynamic(() => import("./CameraComponent"), {
  ssr: false,
});

const Base64 = () => {
  const [base64Image, setBase64Image] = useState("");
  const [status, setStatus] = useState("");
  const [cameraStatus, setCameraStatus] = useState("idle");
  const canvasRef = useRef(null);
  const router = useRouter();
  const [cameraStream, setCameraStream] = useState(null);

  const handleCameraReady = useCallback((stream) => {
    console.log("Camera is ready");
    setCameraStatus("ready");
    setCameraStream(stream);
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setCameraStatus("idle");
    }
  }, [cameraStream]);

  const captureAndGenerateHtml = useCallback(async () => {
    if (cameraStatus !== "ready") {
      setStatus("Camera is not ready yet. Status: " + cameraStatus);
      return;
    }

    const video = document.querySelector("video");
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Data = canvas.toDataURL("image/jpeg").split(",")[1];
      setBase64Image(base64Data);
      console.log("Image captured and encoded");
      setStatus("Image captured. Generating HTML...");

      stopCamera();

      try {
        const response = await fetch("/api/generate-html", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ base64Image: base64Data }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let html = await response.text();

        html = html.replace(/^```html\n|```$/g, "").trim();

        router.push({
          pathname: "/generated-html",
          query: { html: encodeURIComponent(html) },
        });
      } catch (error) {
        console.error("HTML generation failed:", error);
        setStatus(`Failed: ${error.message}`);
      }
    } else {
      console.error("Video or canvas element not found");
      setStatus("Failed to capture image: Video or canvas element not found");
    }
  }, [cameraStatus, router, stopCamera]);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold mb-6 text-center">
                Image to HTML Generator
              </h1>
            </div>
            <div className="space-y-4">
              <DynamicCameraComponent onCameraReady={handleCameraReady} />
              <div>
                <button
                  onClick={captureAndGenerateHtml}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={cameraStatus !== "ready"}
                >
                  Capture Image & Generate HTML
                </button>
              </div>
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {status && (
                <div className="p-4 bg-gray-100 border-l-4 border-gray-500 text-gray-700 rounded">
                  <p>{status}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Base64;
