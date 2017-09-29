'use strict';

// Put variables in global scope to make them available to the browser console.

var constraints = window.constraints = {
  audio: true,
  video: true,
  //fake: false    //for Firefox
};

const configuration = {
 iceServers: [{
   urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
 }]
};

var localpc = null;
var remotepc = null;
var localstream = null;
var remotestream = null;
var localvideo = document.getElementById('localvideo');
var remotevideo = document.getElementById('remotevideo')
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

function getName(pc) {
  return (pc === localpc) ? 'localpc' : 'remotepc';
}

function getOtherPc(pc) {
  return (pc === localpc) ? remotepc : localpc;
}

function start(){
  console.log("Started to get Media.");
  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled =  false;
  navigator.mediaDevices.getUserMedia(constraints).
      then(handleSuccess).catch(handleError);
}

function snap(){
  context.drawImage(document.getElementById('localvideo'),0,0,300,150);
}

function stop(){
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
  var tracks = window.stream.getTracks();
  console.log(tracks);
  tracks.forEach(function(track){
    track.stop();
  })
  localpc.close();
  console.log(localpc);
  remotepc.close();
}

function call(){
  console.log("Started a Call");
  //startTime = window.performance.now();
  var videoTracks = localstream.getVideoTracks();
  var audioTracks = localstream.getAudioTracks();
  if (videoTracks.length > 0) {
    console.log('Using video device: ' + videoTracks[0].label);
  }
  if (audioTracks.length > 0) {
    console.log('Using audio device: ' + audioTracks[0].label);
  }

  localpc = new RTCPeerConnection(configuration);
  console.log(localpc);
  localpc.onicecandidate = function(e) {
    onIceCandidate(localpc, e);
  };
  remotepc = new RTCPeerConnection(configuration);
  console.log(remotepc);
  remotepc.onicecandidate = function(e) {
    onIceCandidate(remotepc, e);
  };
  localpc.oniceconnectionstatechange = function(e) {
    onIceStateChange(localpc, e);
  };
  remotepc.oniceconnectionstatechange = function(e) {
    onIceStateChange(remotepc, e);
  };


  localstream.getTracks().forEach(
    function(track) {
      localpc.addTrack(
        track,localstream
      );
    }
  );
  console.log("Successfully added media streams to localpc");

  localpc.createOffer(
    offerOptions
  ).then(
    onCreateOfferSuccess,
    onCreateSessionDescriptionError
  );
  remotepc.ontrack = gotRemoteStream;
}



function onCreateOfferSuccess(desc) {
  localpc.setLocalDescription(desc).then(
    function() {
      onSetLocalSuccess(localpc);
    },
    onSetSessionDescriptionError
  );
  remotepc.setRemoteDescription(desc).then(
    function() {
      onSetRemoteSuccess(remotepc);
    },
    onSetSessionDescriptionError
  );
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  remotepc.createAnswer().then(
    onCreateAnswerSuccess,
    onCreateSessionDescriptionError
  );
}
function onSetLocalSuccess(pc) {
  console.log(getName(pc) + ' setLocalDescription complete');
}

function onSetRemoteSuccess(pc) {
  console.log(getName(pc) + ' setRemoteDescription complete');
}

function onSetSessionDescriptionError(error) {
  console.log('Failed to set session description: ' + error.toString());
}
function onCreateAnswerSuccess(desc) {
  remotepc.setLocalDescription(desc).then(
    function() {
      onSetLocalSuccess(remotepc);
    },
    onSetSessionDescriptionError
  );
  localpc.setRemoteDescription(desc).then(
    function() {
      onSetRemoteSuccess(localpc);
    },
    onSetSessionDescriptionError
  );
}

function gotRemoteStream(e) {
  if (remotevideo.srcObject !== e.streams[0]) {
    remotevideo.srcObject = e.streams[0];
    console.log('remotepc received remote stream');
  }
}

function onAddIceCandidateSuccess(pc) {
  console.log(getName(pc) + ' addIceCandidate success');
}

function onAddIceCandidateError(pc, error) {
  console.log(getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
}

function onIceStateChange(pc, event) {
  if (pc) {
    console.log(getName(pc) + ' ICE state: ' + pc.iceConnectionState);
    console.log('ICE state change event: ', event);
  }
}
function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}
function onIceCandidate(pc, event) {
  if (event.candidate) {
    getOtherPc(pc).addIceCandidate(
      new RTCIceCandidate(event.candidate)
    ).then(
      function() {
        onAddIceCandidateSuccess(pc);
      },
      function(err) {
        onAddIceCandidateError(pc, err);
      }
    );
    console.log(getName(pc) + ' ICE candidate: \n' + event.candidate.candidate);
  }
}
function handleSuccess(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream inactive');
  };
  window.stream = stream;
  localstream = stream; // make variable available to browser console
  localvideo.src = window.URL.createObjectURL ( stream ) ;
}

function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
  console.log(error.name);
}

function errorMsg(msg, error) {
  console.log(msg);
  //errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}
