import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, doc, setDoc, addDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import "./VideoCall.css";

const VideoCall = () => {
  const { roomId } = useParams();
  const userName = localStorage.getItem("meetingUserName") || "You";
  const navigate = useNavigate();
  const localVideo = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [raisedHand, setRaisedHand] = useState(false);

  // Store peer connections for each user
  const peersRef = useRef({});
  const candidateBuffers = useRef({});

  useEffect(() => {
    let currentUserId = crypto.randomUUID();
    let unsubscribers = [];

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideo.current.srcObject = stream;
        setLocalStream(stream);

        // Register user in Firestore room
        const userDoc = doc(db, "calls", roomId, "users", currentUserId);
        setDoc(userDoc, { joined: Date.now(), name: userName, hand: false });

        // Listen for other users in room
        const usersCol = collection(db, "calls", roomId, "users");
        const unsub = onSnapshot(usersCol, async (snapshot) => {
          const users = snapshot.docs.map(doc => doc.id).filter(id => id !== currentUserId);

          users.forEach(remoteId => {
            if (!peersRef.current[remoteId]) {
              const pc = new RTCPeerConnection({ iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] });
              stream.getTracks().forEach(track => pc.addTrack(track, stream));

              pc.ontrack = (event) => {
                setRemoteStreams(prev => {
                  if (prev.find(s => s.id === remoteId)) return prev;
                  return [...prev, { id: remoteId, stream: event.streams[0] }];
                });
              };

              // ICE candidate exchange
              const candidatesCol = collection(db, "calls", roomId, "candidates");
              pc.onicecandidate = (event) => {
                if (event.candidate) {
                  addDoc(candidatesCol, {
                    from: currentUserId,
                    to: remoteId,
                    candidate: event.candidate.toJSON()
                  });
                }
              };

              // Buffer for ICE candidates
              candidateBuffers.current[remoteId] = [];

              // Listen for incoming offers from others
              const incomingOfferDoc = doc(db, "calls", roomId, "offers", `${remoteId}_${currentUserId}`);
              onSnapshot(incomingOfferDoc, async (snap) => {
                const data = snap.data();
                if (data?.offer && !pc.currentRemoteDescription) {
                  await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                  // Create and send answer
                  const answer = await pc.createAnswer();
                  await pc.setLocalDescription(answer);
                  const answerDoc = doc(db, "calls", roomId, "answers", `${currentUserId}_${remoteId}`);
                  await setDoc(answerDoc, { answer: { type: answer.type, sdp: answer.sdp } });
                }
              });

              // Listen for remote ICE
              onSnapshot(candidatesCol, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                  const data = change.doc.data();
                  if (data.to === currentUserId && data.from === remoteId) {
                    if (pc.remoteDescription && pc.remoteDescription.type) {
                      pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                    } else {
                      candidateBuffers.current[remoteId].push(data.candidate);
                    }
                  }
                });
              });

              // Offer/Answer exchange
              const offerDoc = doc(db, "calls", roomId, "offers", `${currentUserId}_${remoteId}`);
              pc.createOffer().then(offer => {
                pc.setLocalDescription(offer);
                setDoc(offerDoc, { offer: { type: offer.type, sdp: offer.sdp } });
              });

              // Listen for answer
              const answerDoc = doc(db, "calls", roomId, "answers", `${remoteId}_${currentUserId}`);
              const unsubAnswer = onSnapshot(answerDoc, (snap) => {
                const data = snap.data();
                if (data?.answer && !pc.remoteDescription) {
                  pc.setRemoteDescription(new RTCSessionDescription(data.answer)).then(() => {
                    // Add buffered candidates
                    const queue = candidateBuffers.current[remoteId] || [];
                    queue.forEach(candidate => {
                      pc.addIceCandidate(new RTCIceCandidate(candidate));
                    });
                    candidateBuffers.current[remoteId] = [];
                  });
                }
              });

              peersRef.current[remoteId] = { pc, unsubAnswer };
            }
          });
        });

        unsubscribers.push(unsub);

        // Cleanup on leave
        return () => {
          Object.values(peersRef.current).forEach(({ pc, unsubAnswer }) => {
            pc.close();
            if (unsubAnswer) unsubAnswer();
          });
          unsubscribers.forEach(u => u());
          deleteDoc(doc(db, "calls", roomId, "users", currentUserId));
          setRemoteStreams([]);
        };
      })
      .catch(() => {
        alert("Camera/Mic permission denied!");
        navigate("/");
      });
  }, [roomId, navigate, userName]);

  // Mic toggle
  const handleMicToggle = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !micOn);
      setMicOn(!micOn);
    }
  };

  // Camera toggle
  const handleCamToggle = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !camOn);
      setCamOn(!camOn);
    }
  };

  // Raise hand
  const handleRaiseHand = () => {
    setRaisedHand(!raisedHand);
    // Update Firestore user doc with hand status if needed
  };

  // End meeting
  const handleEndMeeting = () => {
    navigate("/");
  };

  return (
    <div className="video-call-ui">
      <div className="video-grid">
        <div className="video-box">
          <video ref={localVideo} autoPlay playsInline muted style={{ width: "300px", borderRadius: "10px", border: "2px solid #4f46e5" }} />
          <div className="video-label">{userName}</div>
        </div>
        {remoteStreams.map(({ id, stream }) => (
          <div key={id} className="video-box">
            <video
              autoPlay
              playsInline
              style={{ width: "300px", borderRadius: "10px", border: "2px solid #4f46e5" }}
              ref={el => { if (el) el.srcObject = stream; }}
            />
            <div className="video-label">User: {id}</div>
          </div>
        ))}
      </div>
      <div className="controls-buttons">
        <button onClick={handleMicToggle}>{micOn ? "Mic Off" : "Mic On"}</button>
        <button onClick={handleCamToggle}>{camOn ? "Camera Off" : "Camera On"}</button>
        <button onClick={handleRaiseHand}>{raisedHand ? "Lower Hand" : "Raise Hand"}</button>
        <button onClick={handleEndMeeting}>End Meeting</button>
      </div>
    </div>
  );
};

export default VideoCall;