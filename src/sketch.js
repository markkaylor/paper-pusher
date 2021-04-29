const MidiPlayer = require('midi-player-js')
const axios = require('axios')
const colors = require('./colors.json')
const audioContext = new AudioContext()

const canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')

const SIZE = 800
const { noteColors } = colors

const dpr = window.devicePixelRatio || 1

canvas.height = SIZE * dpr
canvas.width = SIZE * dpr
ctx.scale(dpr, dpr)

const getMidi = async () => {
  const result = await axios.get('./assets/midi-piano-ostinato.mid', {
    responseType: 'arraybuffer',
  })
  const { data } = result
  return data
}

const getAudio = async () => {
  const result = await axios.get('./assets/audio-piano-ostinato.mp3', {
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

const getRandomCoordinate = () => {
  return Math.floor(Math.random() * SIZE)
}

const visualize = async () => {
  const midi = await getMidi()
  const Player = new MidiPlayer.Player()
  Player.loadArrayBuffer(midi)
  await playAudio()
  Player.play()

  const sentence = `Practicing an art, no matter how well or badly, is a way to make your soul grow, for heaven's sake. Sing in the shower. Dance to the radio. Tell stories. Write a poem to a friend, even a lousy poem. Do it as well as you possibly can. You will get an enormous reward. You will have created something.`
  const words = sentence.split(' ')
  let i = 0

  Player.on('midiEvent', function (event) {
    if (event.name === 'Note on') {
      const x = getRandomCoordinate()
      const y = getRandomCoordinate()

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.font = `${event.velocity}px serif`
      const pitch = event.noteName.replace(/([0-9]|[-])/g, '')
      const [r, g, b] = noteColors[pitch]
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.${event.velocity})`
      ctx.textAlign = 'center'
      ctx.fillText(words[i], x, y)

      i++
      if (i >= words.length) {
        i = 0
      }
    }
  })
}

visualize()
