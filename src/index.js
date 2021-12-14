import SuperpoweredGlue from "../static/superpowered/SuperpoweredGlueModule.js";
import { SuperpoweredWebAudio } from "../static/superpowered/SuperpoweredWebAudio.js";

// The sample rate we'd like our AudioContext to operate at
const minimumSampleRate = 48000;

// The  location of the superpowered WebAssembly library
const superPoweredWasmLocation = "/static/superpowered/superpowered.wasm";
// The  location of the processor from the browser to fetch
const toneProcessorUrl = "/static/processors/generatorProcessor.js";

class DemoApplication {
  constructor() {
    this.superpowered = null;
    this.webaudioManager = null;
    this.boot();
  }

  async boot() {
    await this.setupSuperpowered();
    await this.loadProcessor();
  }

  async setupSuperpowered() {
    this.superpowered = await SuperpoweredGlue.fetch(superPoweredWasmLocation);
    this.superpowered.Initialize({
      licenseKey: "ExampleLicenseKey-WillExpire-OnNextUpdate",
      enableAudioAnalysis: true,
      enableFFTAndFrequencyDomain: true,
      enableAudioTimeStretching: true,
      enableAudioEffects: true,
      enableAudioPlayerAndDecoder: true,
      enableCryptographics: false,
      enableNetworking: false
    });
    this.webaudioManager = new SuperpoweredWebAudio(
      minimumSampleRate,
      this.superpowered
    );
  }

  onMessageProcessorAudioScope = (message) => {
    // Here is where we receive serialisable message from the audio scope.
    // We're sending our own ready event payload when the proeccesor is fully innitialised
    if (message.event === "ready") this.switchState();
  };

  async loadProcessor() {
    // Now create the AudioWorkletNode, passing in the AudioWorkletProcessor url, it's registered name (defined inside the processor) and a callback then gets called when everything is up a ready
    this.generatorProcessorNode = await this.webaudioManager.createAudioNodeAsync(
      toneProcessorUrl,
      "ToneProcessor",
      this.onMessageProcessorAudioScope
    );

    // Connect the AudioWorkletNode to the WebAudio destination (speakers);
    this.generatorProcessorNode.connect(
      this.webaudioManager.audioContext.destination
    );
    this.webaudioManager.audioContext.suspend();
  }

  resumeContext() {
    this.webaudioManager.audioContext.resume();
  }

  switchState() {
    document.getElementById("ready").style.display = "flex";
    document.getElementById("loading").style.display = "none";
  }
}

const demoApp = new DemoApplication();

window.resumeContext = demoApp.resumeContext.bind(demoApp);
