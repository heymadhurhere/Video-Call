import React, { useRef, useState, useEffect } from "react";
import { TextField, Button, IconButton, Badge } from "@mui/material";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import styles from "../styles/videoComponent.module.css";
import VideocamOffTwoToneIcon from '@mui/icons-material/VideocamOffTwoTone';
import VideocamTwoToneIcon from '@mui/icons-material/VideocamTwoTone';
import CallEndTwoToneIcon from '@mui/icons-material/CallEndTwoTone';
import MicOffTwoToneIcon from '@mui/icons-material/MicOffTwoTone';
import MicNoneTwoToneIcon from '@mui/icons-material/MicNoneTwoTone';
import ScreenShare from '@mui/icons-material/ScreenShareTwoTone';
import ScreenShareOff from '@mui/icons-material/StopScreenShareTwoTone';
import ChatIcon from '@mui/icons-material/Chat';

import { IS_PROD, server } from "../environment";

const server_url = server;
var connections = {};

const peerConfigConnections = {
    "iceServers": [
        {
            "urls": "stun:stun.l.google.com:19302"
        }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();
    const videoRef = useRef([]);

    let [videoAvailable, setVideoAvailable] = useState(true); // video off and on feature
    let [audioAvailable, setAudioAvailable] = useState(true); // audio off and on feature
    let [video, setVideo] = useState([]); // video is currently on or off
    let [audio, setAudio] = useState(); // audio is currently on or off
    let [screen, setScreen] = useState(); // screen share active or not
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState(); // does browser support screen sharing
    let [messages, setMessages] = useState([]); // all chat messages
    let [message, setMessage] = useState(); // current chat message
    let [newMessages, setNewMessages] = useState(0); // unread messages
    let [askForUsername, setaskForUsername] = useState(true); // for guest mode login
    let [username, setUsername] = useState(""); // for guest mode
    let [videos, setVideos] = useState([]);

    // TODO
    // if (isChrome() === false) {

    // }

    // ASK the browser for permission to use the media devices
    const getPermissions = async () => { // async because permission requests take time
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true }); // ask for video permission
            if (videoPermission) {
                setVideoAvailable(true); // if permission is granted set the video to true
            } else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true }); // ask for audio permission
            if (audioPermission) {
                setAudioAvailable(true); // if permission is granted set the audio to true
            } else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) { // checks if the browser supports screen sharing (works in chromium based browsers)
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable }) // if the video or audio is available

                if (userMediaStream) { // then proceed to screen share feature
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getPermissions();
    }, []);

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) {
            console.log(e);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) { // here id is same as id2 used in socket.on("signal")
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
                }).catch(e => console.log(e));
            }).catch(e => console.log(e));
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setAudio(false);
            setVideo(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) {
                console.log(e);
            }

            // TODO blacksilence

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream);

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description).then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
                    }).catch(e => console.log(e));
                })
            }
        })
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();

        let dst = oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();

        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }


    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });

        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();

        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio }).then(getUserMediaSuccess) // to do getusermediasuccess
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            catch {

            }
        }
    }

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video])

    //TODO
    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === "offer") {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }))
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    }

    // TODO
    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);

        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevMessages) => prevMessages + 1);
        }
    }


    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href);

            socketIdRef.current = socketRef.current.id;

            socketRef.current.on("chat-message", addMessage);

            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
            });

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event) => { // it is to establish a direct connection between the two peers
                        if (event.candidate !== null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        console.log('onaddstream from', socketListId, event);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos
                            })
                        } else {

                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playsinline: true,
                            }

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);

                    } else {
                        // TODO
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;

                        try {
                            connections[id2].addStream(window.localStream);
                        } catch (e) {

                        }
                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            });
        });
    }

    let routeTo = useNavigate();


    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let connect = () => {
        setaskForUsername(false);
        getMedia();
    }

    let handleVideo = () => {
        setVideo(!video);
    }

    let handlleAudio = () => {
        setAudio(!audio);
    }

    let getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());

        } catch (e) { console.log(e) }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                    }).catch(e => console.log(e));

            }).catch(e => console.log(e));

        }
        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) {
                console.log(e);
            }

            // TODO blacksilence

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();
        })
    }

    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e));
            }
        }
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen);
    }

    let sendMessage = () => {
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        } catch (e) {

        }

        routeTo("/home");
    }



    return (
        <div>
            {askForUsername === true ?
                <div>
                    <h2>Enter into room</h2>
                    <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" onClick={connect}>Connect</Button>

                    <div>
                        <video ref={localVideoRef} autoPlay muted ></video>
                    </div>

                </div> :
                <div className={styles.meetVideoContainer}>

                    {showModal ? <div className={styles.chatRoom}>
                        <div className={styles.chatContainer}>
                            <h1>Chat</h1>

                            <div className={styles.chattingDisplay}>

                                {messages.length > 0 ? messages.map((item, index) => {
                                    return (
                                        <div style={{ marginBottom: "20px" }} key={index}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>Start a conversation</p>}

                            </div>
                            <div className={styles.chattingArea}>

                                <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter your message" variant="outlined" />
                                <Button onClick={sendMessage} variant="contained">Send</Button>
                            </div>
                        </div>
                    </div> : <></>}


                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamTwoToneIcon /> : <VideocamOffTwoToneIcon />}
                        </IconButton>

                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndTwoToneIcon />
                        </IconButton>

                        <IconButton onClick={handlleAudio} style={{ color: "white" }}>
                            {(audio === true) ? <MicNoneTwoToneIcon /> : <MicOffTwoToneIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShare /> : <ScreenShareOff />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color="secondary">
                            <IconButton onClick={() =>{ setModal(!showModal); setNewMessages(0);} } style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>

                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>
                    <div className={styles.conferenceView}>
                        {videos.map((video) => (

                            <div key={video.socketId}>

                                <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }} autoPlay></video>
                            </div>

                        ))}
                    </div>

                </div>}
        </div>
    );
}