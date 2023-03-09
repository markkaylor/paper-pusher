const MidiPlayer = require("midi-player-js");
const axios = require("axios");
const colors = require("./colors.json");
const audioContext = new AudioContext();

const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function getSize() {
  return {
    height: window.innerHeight,
    width: window.innerWidth,
  };
}

const { height, width } = getSize();
canvas.width = width;
canvas.height = height;

window.addEventListener("resize", resizeCanvas, false);

function resizeCanvas() {
  const { height, width } = getSize();
  canvas.width = width;
  canvas.height = height;
}

const getMidi = async () => {
  const result = await axios.get("./assets/midi-piano-ostinato.mid", {
    responseType: "arraybuffer",
  });
  const { data } = result;
  return data;
};

const getAudio = async () => {
  const result = await axios.get("./assets/audio-piano-ostinato.mp3", {
    responseType: "arraybuffer",
  });
  const { data } = result;
  const decodedAudioData = await audioContext.decodeAudioData(data);
  return decodedAudioData;
};

const playAudio = async () => {
  const audioBuffer = await getAudio();
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};

const getRandomCoordinate = () => {
  return {
    x: Math.floor(Math.random() * getSize().width),
    y: Math.floor(Math.random() * getSize().height),
  };
};

const input = document.getElementById("input");
const playButton = document.getElementById("playButton");

const INITIAL_PHRASE = `Hey 👋, It's me, Mark. I'm a software developer and musician. Hear some of my music and make these words more interesting by hitting play.`;

let phrase = INITIAL_PHRASE;
let words = phrase.split(" ");

input.innerText = phrase;

input.addEventListener("input", (e) => {
  input.innerText = e.target.value;
  phrase = e.target.value;
});

playButton.addEventListener("click", () => {
  playButton.disabled = true;
  words = phrase.split(" ");
  console.log(phrase);
  visualize();
});

const { noteColors } = colors;
const visualize = async () => {
  const midi = await getMidi();
  const Player = new MidiPlayer.Player();
  Player.loadArrayBuffer(midi);
  await playAudio();
  Player.play();

  let i = 0;
  Player.on("midiEvent", function (event) {
    if (event.name === "Note on") {
      const x = getRandomCoordinate().x;
      const y = getRandomCoordinate().y;
      const pitch = event.noteName.replace(/([0-9]|[-])/g, "");
      const [r, g, b] = noteColors[pitch];

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.font = `${event.velocity}px serif`;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.${event.velocity})`;
      ctx.textAlign = "center";
      ctx.fillText(words[i], x, y);

      i++;
      if (i >= words.length) {
        i = 0;
      }
    }
  });
};
