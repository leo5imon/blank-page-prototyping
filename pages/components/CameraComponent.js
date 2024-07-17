import React, { useRef, useState, useEffect, useCallback } from "react";

const CameraComponent = ({ onCameraReady }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");

  const startCamera = useCallback(async () => {
    setError(null);
    setStatus("initializing");
    try {
      console.log("Requesting camera access...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      console.log("Camera access granted");
      setStream(mediaStream);
      setStatus("stream-acquired");
    } catch (err) {
      console.error("Error accessing the camera: ", err);
      setError(err.message || "Failed to access camera");
      setStatus("access-failed");
    }
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      console.log("Setting video source");
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded");
        videoRef.current
          .play()
          .then(() => {
            console.log("Video playback started");
            setStatus("playing");
            if (onCameraReady) onCameraReady(stream);
          })
          .catch((playError) => {
            console.error("Error starting video playback:", playError);
            setError("Failed to start video playback: " + playError.message);
            setStatus("playback-failed");
          });
      };
    }
  }, [stream, onCameraReady]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  if (typeof window === "undefined") {
    return null;
  }

  return (
    <div className="relative w-full" style={{ paddingTop: "150%" }}>
      {" "}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
      />
      {status !== "playing" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <p className="text-white">
            {status === "initializing"
              ? "Starting camera..."
              : "Camera not available"}
          </p>
        </div>
      )}
      {error && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-red-100 border-t-4 border-red-500 text-red-700">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <p className="mt-2">
            Please ensure you've granted camera permissions to this website.
          </p>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
