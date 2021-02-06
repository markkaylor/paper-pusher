const MidiPlayer = require('midi-player-js')
const axios = require('axios')
const audioContext = new AudioContext()

const canvas = document.getElementById('canvas')
ctx = canvas.getContext('2d')

const size = 200

const dpr = window.devicePixelRatio
canvas.height = size * dpr
canvas.width = size * dpr
ctx.scale(dpr, dpr)
ctx.translate(size / 2, size / 2)

const getMidi = async () => {
  const result = await axios.get('', {
    responseType: 'arraybuffer',
  })
  const { data } = result
  return data
}

const getAudio = async () => {
  const result = await axios.get('', {
    responseType: 'arraybuffer',
  })
  const { data } = result
  const decodedAudioData = await audioContext.decodeAudioData(data)
  return decodedAudioData
}

const playAudio = async () => {
  const audioBuffer = await getAudio()
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(audioContext.destination)
  source.start()
}

const visualize = async () => {
  const midi = await getMidi()
  const Player = new MidiPlayer.Player()
  Player.loadArrayBuffer(midi)
  await playAudio()
  Player.play()

  Player.on('midiEvent', function (event) {
    // Do stuff!
    console.log(event)
  })
}

visualize()
