import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [images, setImages] = useState([]);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  // Access the camera
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Error accessing camera:", err));
    }
  }, []);

  // Start capturing images
  const startCapture = () => {
    setIsCapturing(true);
    intervalRef.current = setInterval(captureImage, 5000); // Capture every 5 seconds
  };

  // Stop capturing images
  const stopCapture = () => {
    setIsCapturing(false);
    clearInterval(intervalRef.current);
  };

  // Capture image and geolocation
  const captureImage = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "capture.png");

      // Get geolocation
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          formData.append("latitude", latitude);
          formData.append("longitude", longitude);

          // Upload image and geolocation to backend
          const response = await axios.post("http://localhost:5000/upload", formData);
          setImages((prev) => [...prev, response.data]);
        },
        (err) => console.error("Error getting geolocation:", err)
      );
    }, "image/png");
  };

  return (
    <div className="App">
      <h1>Geolocation Image Capture</h1>
      <div className="camera-preview">
        <video ref={videoRef} autoPlay playsInline muted />
      </div>
      <div className="controls">
        <button className="start-button" onClick={startCapture} disabled={isCapturing}>
          Start
        </button>
        <button className="stop-button" onClick={stopCapture} disabled={!isCapturing}>
          Stop
        </button>
      </div>
      <div className="gallery">
        {images.map((img, index) => (
          <div key={index} className="image-card">
            <img src={img.imageUrl} alt={`Capture ${index}`} />
            <p>Lat: {img.latitude}, Long: {img.longitude}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
