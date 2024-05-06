"use client";

import { useRef, useEffect } from 'react'
import * as faceapi from 'face-api.js'


function Home() {
  const mediaRef = useRef(null);
  const videoRef = useRef()
  const canvasRef = useRef()



  useEffect(() => {
    startVideo();
    videoRef && loadModels()

  }, [])

 
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then((currentStream) => {
      if (currentStream) {
        videoRef.current.srcObject = currentStream
      } else {
      
        mediaRef.current.src = ''
      }
    })
    .catch((err) => {
      console.log(err)
      mediaRef.current.src = ''
      alert("Please enable the Webcamera")
    })
  }


  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'), 
    ]).then(() => {
      faceMyDetect()
    })
  }

  const faceMyDetect = () => {
    let undetectedCounter = 0;
   
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()

      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current)
      faceapi.matchDimensions(canvasRef.current, {
        width: 10,
        height: 10
      })
      
      const resized = faceapi.resizeResults(detections, {
        width: 10,
        height: 10
      })

      faceapi.draw.drawDetections(canvasRef.current, resized)
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)

      if (detections.length === 2) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg');
        // const encode = btoa(dataURL)
        // const decode = atob(encode)
        // console.log(decode);
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'faces_detected.jpg';
        a.click();
      }

      
      if (detections.length == 0) {
        undetectedCounter++;
        if (undetectedCounter == 3) {
          mediaRef.current.pause();
          alert("Please sit in a bright place");
        }
        else if (undetectedCounter == 10) {
          mediaRef.current.pause();
          alert("No face detected for Please sit in a bright place and continue");
        }
      } else {
        undetectedCounter = 0;
      }
     
  console.log(undetectedCounter);
      if (detections.length > 1) {
        alert("face detected");
      }
      console.log(detections);
    }, 1000)
      
  }

  return (
    <>
      <div className="w-full h-screen">
        <video crossOrigin="anonymous"  className="absolute" ref={videoRef} autoPlay width="0" height="0"></video>
        <video src='Solo.mp4' id="video" className='w-full h-screen' controls ref={mediaRef}></video>
        <canvas ref={canvasRef}
          className="absolute" />
      </div>
    </>
  )

}

export default Home;