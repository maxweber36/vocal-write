/**
 * @fileoverview AudioWorkletProcessor 用于处理音频数据，将其转换为 16-bit PCM 并计算音量。
 */

/**
 * @class AudioProcessor
 * @extends AudioWorkletProcessor
 * @description Processes audio data in an AudioWorklet, converting it to 16-bit PCM and calculating volume.
 */
class AudioProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'bufferSize', defaultValue: 128 }]
  }

  constructor(options) {
    super(options)
    this.bufferSize = options.processorOptions.bufferSize || 128
    this.buffer = new Float32Array(this.bufferSize)
    this.bufferIndex = 0
    this.lastVolume = 0
  }

  /**
   * 将 Float32Array 的音频数据转换为 16-bit PCM 格式。
   * @param {Float32Array} input - Web Audio API 输出的浮点数音频样本。
   * @returns {Int16Array} - 16-bit PCM 格式的音频样本。
   */
  float32To16BitPCM(input) {
    const output = new Int16Array(input.length)
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]))
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    return output
  }

  process(inputs, outputs, parameters) {
    const bufferSize = parameters.bufferSize[0]
    if (this.bufferSize !== bufferSize) {
      this.bufferSize = bufferSize
      this.buffer = new Float32Array(bufferSize)
      this.bufferIndex = 0
    }
    const input = inputs[0]
    if (!input || !input[0]) {
      return true
    }

    const channelData = input[0]

    // 填充缓冲区
    const remaining = this.buffer.length - this.bufferIndex
    const toCopy = Math.min(remaining, channelData.length)
    this.buffer.set(channelData.subarray(0, toCopy), this.bufferIndex)
    this.bufferIndex += toCopy

    if (this.bufferIndex >= this.bufferSize) {
      const pcmData = this.float32To16BitPCM(this.buffer)

      // Calculate volume (RMS) with smoothing
      let sum = 0.0
      for (let i = 0; i < this.buffer.length; ++i) {
        sum += this.buffer[i] * this.buffer[i]
      }
      const rms = Math.sqrt(sum / this.buffer.length)
      const volume = Math.max(rms, this.lastVolume * 0.85) // Smoothing
      this.lastVolume = volume

      this.port.postMessage({ pcmData, volume })

      // 重置 buffer
      this.buffer.fill(0)
      this.bufferIndex = 0

      // 处理剩余数据
      const leftover = channelData.length - toCopy
      if (leftover > 0) {
        this.buffer.set(channelData.subarray(toCopy), 0)
        this.bufferIndex = leftover
      }
    }

    return true
  }
}

registerProcessor('audio-processor', AudioProcessor)
