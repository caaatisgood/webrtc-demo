let peerConnection;
let localStream;
let remoteStream;

let servers = {
  iceServers: [
    {
      urls: [
        'stun:stun1.1.google.com:19302',
        'stun:stun2.1.google.com:19302',
      ],
    },
  ]
}

let init = async () => {
  localStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  })

  document.getElementById("user-1").srcObject = localStream
}

let createPeerConnection = (sdpType) => {
  peerConnection = new RTCPeerConnection(servers)

  remoteStream = new MediaStream()
  document.getElementById("user-2").srcObject = remoteStream

  // add the local tracks to peerConnection
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream)
  })

  // any new track added to the peerConnection side, put it on the remote stream
  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track)
    })
  }

  // called each time when the ice candidate is generated, and returned from the STUN server
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      // update the value every time a new candidate is received
      document.getElementById(`${sdpType}-sdp`).value =
        JSON.stringify(peerConnection.localDescription, null, 2)
    }
  }
}

let createOffer = async () => {
  createPeerConnection("offer")

  let offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)

  document.getElementById("offer-sdp").value =
    JSON.stringify(offer, null, 2)
}

let createAnswer = async () => {
  createPeerConnection("answer")

  let offer = document.getElementById("offer-sdp").value
  if (!offer) {
    alert('Retrieve offer from peer first')
    return
  }

  offer = JSON.parse(offer)
  await peerConnection.setRemoteDescription(offer)

  let answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)

  document.getElementById("answer-sdp").value =
    JSON.stringify(answer, null, 2)
}

let addAnswer = async () => {
  let answer = document.getElementById("answer-sdp").value
  if (!answer) {
    alert('Retrieve answer from peer first')
    return
  }

  answer = JSON.parse(answer)

  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer)
  }
}

init()

document.getElementById('create-offer').addEventListener("click", createOffer)
document.getElementById('create-answer').addEventListener("click", createAnswer)
document.getElementById('add-answer').addEventListener("click", addAnswer)
