import  "../static/js/Superpowered.js";

// The  location of the superpowered WebAssembly library
// The  location of the processor from the browser to fetch
const sineToneProcessorUrl = "/static/processors/generatorProcessor.js";
const spUrl = "/static/js/Superpowered.js";
// The sample rate we'd like our AudioContext to operate at
const minimumSampleRate = 48000;

class DemoApplication {
  constructor() {
    this.webaudioManager = null;
    this.boot();
  }

  async boot() {
    await this.setupSuperpowered();
    await this.loadProcessor();
  }

  onMessageProcessorAudioScope = (message) => {
    console.log(message);
    // Here is where we receive serialisable message from the audio scope.
    // We're sending our own ready event payload when the proeccesor is fully innitialised
    if (message.event === "ready") {
      document.getElementById("ready").disabled = false;
    }
  };

  async setupSuperpowered() {
    this.superpowered = await SuperpoweredGlue.Instantiate(
      "ExampleLicenseKey-WillExpire-OnNextUpdate",
      spUrl
    );
   
    this.webaudioManager = new SuperpoweredWebAudio(
      minimumSampleRate,
      this.superpowered
    );
    console.log(`Running Superpowered v${this.superpowered.Version()}`);
  }

  async loadProcessor() {
    // Now create the AudioWorkletNode, passing in the AudioWorkletProcessor url, it's registered name (defined inside the processor) and a callback then gets called when everything is up a ready
    this.generatorProcessorNode = await this.webaudioManager.createAudioNodeAsync(
      sineToneProcessorUrl,
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
    console.log("resuming");
    this.webaudioManager.audioContext.resume();
    // document.getElementById("startButton").style.display = "none";
  }
}

const demoApp = new DemoApplication();

// expose a function to the window so we can call it from the HTML markup
window.resumeContext = demoApp.resumeContext.bind(demoApp);
