// Import the SuperpoweredWebAudio helper to allow us to extend the SuperpoweredWebAudio.AudioWorkletProcessor class
import { SuperpoweredWebAudio } from "../superpowered/SuperpoweredWebAudio.js";

// We create an AudioWorkletProcessor, extending from the SuperpoweredWebAudio helper
// The parent injects the Superpowered WebAssembly for us to use here.
class ToneProcessor extends SuperpoweredWebAudio.AudioWorkletProcessor {
  // Runs once after construction
  onReady() {
    // Create an instance of a SP generator class
    this.generator = new this.Superpowered.Generator(
      this.samplerate, // The initial sample rate in Hz, set by the parent class you extended from
      this.Superpowered.Generator.Sine // The initial shape.
    );
    this.generator.frequency = 440; // Generate a simple test tone at A4.
    // Pass an event object over to the main scope to tell it everything is ready
    this.sendMessageToMainScope({ event: "ready" });
  }

  // onDestruct is called when the parent AudioWorkletNode.destruct() method is called.
  // You should clear up all SP class instances here.
  onDestruct() {
    this.generator.destruct();
  }

  // This is called through the extended SuperpoweredWebAudio.AudioWorkletProcessor
  // Consider this the process loop, called with the AudioContexts input and output buffers
  // You should not allocate memory here
  processAudio(inputBuffer, outputBuffer, buffersize, parameters) {
    this.generator.generate(
      outputBuffer.pointer, // output, // Pointer to floating point numbers. 32-bit MONO output.
      buffersize * 2 // ? not true - we multiple this by two becuase .generate returns a monto signal whereas the outputBuffer is interleaved stereo.
    );
  }
}

// The following code registers the processor script in the browser, notice the label and reference
// To keep it simpler, these should replicate the name of you AudioWorklet Class
if (typeof AudioWorkletProcessor !== "undefined")
  registerProcessor("ToneProcessor", ToneProcessor);
export default ToneProcessor;
