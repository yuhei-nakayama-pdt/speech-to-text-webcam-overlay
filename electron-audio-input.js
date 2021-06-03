const initAudio = () => {
  const audioCtx = new (AudioContext || webkitAudioContext)({
    sampleRate: 16000,
  });
  window.audioCtx = audioCtx; // デバッグ用
  const scriptProcessorNode = audioCtx.createScriptProcessor(8192, 1, 1);

  const handleAudioStream = (stream) => {
    console.log({ stream });
    const microphoneSource = audioCtx.createMediaStreamSource(stream);
    microphoneSource.connect(scriptProcessorNode);
    scriptProcessorNode.connect(audioCtx.destination); // スピーカーに渡してるけど0なので鳴らない
  };

  scriptProcessorNode.addEventListener(
    "audioprocess",
    function (audioProcessingEvent) {
      const inputBuffer = audioProcessingEvent.inputBuffer;
      const inputData = inputBuffer.getChannelData(0); // 1チャンネル固定
      const int16InputData = new Int16Array(inputData.length);
      for (let i = 0; i < inputBuffer.length; i++) {
        const s = inputData[i];
        int16InputData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      // TODO: 音量小さかったら送らないとしたい
      window.electron.send("audioInput", int16InputData);
    }
  );
  navigator.mediaDevices
    .getUserMedia({
      video: false,
      audio: {
        sampleRate: {
          ideal: 16000,
        },
      },
    })
    .then(handleAudioStream)
    .catch((e) => {
      console.error({ e });
    });
};

initAudio();
