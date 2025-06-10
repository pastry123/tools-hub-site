import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export interface VideoToGifOptions {
  startTime?: number;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  quality?: 'low' | 'medium' | 'high';
}

export interface AudioConversionOptions {
  format: 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac' | 'm4a' | 'wma' | 'opus' | 'ac3' | 'amr' | 'au' | 'ra' | 'mp2' | 'aiff' | 'dts' | 'ape' | 'tak' | 'tta' | 'gsm' | 'voc';
  bitrate?: string;
  sampleRate?: number;
  channels?: number;
  quality?: 'low' | 'medium' | 'high';
}

export interface VideoConversionOptions {
  format: 'mp4' | 'avi' | 'mov' | 'webm' | 'mkv';
  quality?: 'low' | 'medium' | 'high';
  resolution?: string;
  bitrate?: string;
}

export class MediaService {
  private tempDir = path.join(process.cwd(), 'temp');

  constructor() {
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  async convertVideoToGif(
    inputBuffer: Buffer,
    options: VideoToGifOptions = {}
  ): Promise<Buffer> {
    const inputId = nanoid();
    const outputId = nanoid();
    const inputPath = path.join(this.tempDir, `${inputId}.mp4`);
    const outputPath = path.join(this.tempDir, `${outputId}.gif`);

    try {
      // Write input file
      await fs.writeFile(inputPath, inputBuffer);

      // Build FFmpeg command
      const ffmpegArgs = ['-i', inputPath];

      // Add start time if specified
      if (options.startTime) {
        ffmpegArgs.push('-ss', options.startTime.toString());
      }

      // Add duration if specified
      if (options.duration) {
        ffmpegArgs.push('-t', options.duration.toString());
      }

      // Add video filters for GIF optimization
      const filters = [];
      
      // Resize if specified
      if (options.width || options.height) {
        const width = options.width || -1;
        const height = options.height || -1;
        filters.push(`scale=${width}:${height}`);
      }

      // Set FPS
      const fps = options.fps || 10;
      filters.push(`fps=${fps}`);

      // Quality settings
      const palette = options.quality === 'high' ? '256' : options.quality === 'medium' ? '128' : '64';
      
      if (filters.length > 0) {
        ffmpegArgs.push('-vf', filters.join(','));
      }

      ffmpegArgs.push('-y', outputPath);

      // Execute FFmpeg command
      await this.executeFFmpeg(ffmpegArgs);

      // Read and return output
      const outputBuffer = await fs.readFile(outputPath);
      
      // Cleanup
      await this.cleanup([inputPath, outputPath]);
      
      return outputBuffer;
    } catch (error) {
      // Cleanup on error
      await this.cleanup([inputPath, outputPath]);
      throw new Error(`Video to GIF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async convertAudio(
    inputBuffer: Buffer,
    inputFormat: string,
    options: AudioConversionOptions
  ): Promise<Buffer> {
    const inputId = nanoid();
    const outputId = nanoid();
    const inputExt = this.getInputExtension(inputFormat);
    const inputPath = path.join(this.tempDir, `${inputId}${inputExt}`);
    const outputPath = path.join(this.tempDir, `${outputId}.${options.format}`);

    try {
      // Write input file
      await fs.writeFile(inputPath, inputBuffer);

      // Build FFmpeg command
      const ffmpegArgs = ['-i', inputPath];

      // Audio codec based on format
      switch (options.format) {
        case 'mp3':
          ffmpegArgs.push('-codec:a', 'libmp3lame');
          break;
        case 'wav':
          ffmpegArgs.push('-codec:a', 'pcm_s16le');
          break;
        case 'ogg':
          ffmpegArgs.push('-codec:a', 'libvorbis');
          break;
        case 'aac':
          ffmpegArgs.push('-codec:a', 'aac');
          break;
        case 'flac':
          ffmpegArgs.push('-codec:a', 'flac');
          break;
        case 'm4a':
          ffmpegArgs.push('-codec:a', 'aac');
          break;
        case 'wma':
          ffmpegArgs.push('-codec:a', 'wmav2');
          break;
        case 'opus':
          ffmpegArgs.push('-codec:a', 'libopus');
          break;
        case 'ac3':
          ffmpegArgs.push('-codec:a', 'ac3');
          break;
        case 'amr':
          ffmpegArgs.push('-codec:a', 'libopencore_amrnb');
          break;
        case 'au':
          ffmpegArgs.push('-codec:a', 'pcm_mulaw');
          break;
        case 'ra':
          ffmpegArgs.push('-codec:a', 'real_144');
          break;
        case 'mp2':
          ffmpegArgs.push('-codec:a', 'mp2');
          break;
        case 'aiff':
          ffmpegArgs.push('-codec:a', 'pcm_s16be');
          break;
        case 'dts':
          ffmpegArgs.push('-codec:a', 'dts');
          break;
        case 'ape':
          ffmpegArgs.push('-codec:a', 'ape');
          break;
        case 'tak':
          ffmpegArgs.push('-codec:a', 'tak');
          break;
        case 'tta':
          ffmpegArgs.push('-codec:a', 'tta');
          break;
        case 'gsm':
          ffmpegArgs.push('-codec:a', 'gsm');
          break;
        case 'voc':
          ffmpegArgs.push('-codec:a', 'pcm_u8');
          break;
      }

      // Audio quality settings
      if (options.bitrate) {
        ffmpegArgs.push('-b:a', options.bitrate);
      } else {
        // Default bitrates based on quality
        const bitrates = {
          low: '128k',
          medium: '192k',
          high: '320k'
        };
        ffmpegArgs.push('-b:a', bitrates[options.quality || 'medium']);
      }

      // Sample rate
      if (options.sampleRate) {
        ffmpegArgs.push('-ar', options.sampleRate.toString());
      }

      // Channels
      if (options.channels) {
        ffmpegArgs.push('-ac', options.channels.toString());
      }

      ffmpegArgs.push('-y', outputPath);

      // Execute FFmpeg command
      await this.executeFFmpeg(ffmpegArgs);

      // Read and return output
      const outputBuffer = await fs.readFile(outputPath);
      
      // Cleanup
      await this.cleanup([inputPath, outputPath]);
      
      return outputBuffer;
    } catch (error) {
      // Cleanup on error
      await this.cleanup([inputPath, outputPath]);
      throw new Error(`Audio conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async convertVideo(
    inputBuffer: Buffer,
    inputFormat: string,
    options: VideoConversionOptions
  ): Promise<Buffer> {
    const inputId = nanoid();
    const outputId = nanoid();
    const inputExt = this.getInputExtension(inputFormat);
    const inputPath = path.join(this.tempDir, `${inputId}${inputExt}`);
    const outputPath = path.join(this.tempDir, `${outputId}.${options.format}`);

    try {
      // Write input file
      await fs.writeFile(inputPath, inputBuffer);

      // Build FFmpeg command
      const ffmpegArgs = ['-i', inputPath];

      // Video codec based on format
      switch (options.format) {
        case 'mp4':
          ffmpegArgs.push('-codec:v', 'libx264', '-codec:a', 'aac');
          break;
        case 'webm':
          ffmpegArgs.push('-codec:v', 'libvpx-vp9', '-codec:a', 'libopus');
          break;
        case 'avi':
          ffmpegArgs.push('-codec:v', 'libx264', '-codec:a', 'mp3');
          break;
        case 'mov':
          ffmpegArgs.push('-codec:v', 'libx264', '-codec:a', 'aac');
          break;
        case 'mkv':
          ffmpegArgs.push('-codec:v', 'libx264', '-codec:a', 'aac');
          break;
      }

      // Quality settings
      const crf = options.quality === 'high' ? '18' : options.quality === 'medium' ? '23' : '28';
      ffmpegArgs.push('-crf', crf);

      // Resolution
      if (options.resolution) {
        ffmpegArgs.push('-s', options.resolution);
      }

      // Bitrate
      if (options.bitrate) {
        ffmpegArgs.push('-b:v', options.bitrate);
      }

      ffmpegArgs.push('-y', outputPath);

      // Execute FFmpeg command
      await this.executeFFmpeg(ffmpegArgs);

      // Read and return output
      const outputBuffer = await fs.readFile(outputPath);
      
      // Cleanup
      await this.cleanup([inputPath, outputPath]);
      
      return outputBuffer;
    } catch (error) {
      // Cleanup on error
      await this.cleanup([inputPath, outputPath]);
      throw new Error(`Video conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getInputExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'video/mp4': '.mp4',
      'video/avi': '.avi',
      'video/quicktime': '.mov',
      'video/webm': '.webm',
      'video/x-msvideo': '.avi',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'audio/wave': '.wav',
      'audio/ogg': '.ogg',
      'audio/aac': '.aac',
      'audio/flac': '.flac',
      'audio/x-flac': '.flac',
      'audio/mp4': '.m4a',
      'audio/x-ms-wma': '.wma',
      'audio/opus': '.opus',
      'audio/ac3': '.ac3',
      'audio/amr': '.amr',
      'audio/basic': '.au',
      'audio/vnd.rn-realaudio': '.ra',
      'audio/aiff': '.aiff',
      'audio/x-aiff': '.aiff',
      'audio/dts': '.dts',
      'audio/ape': '.ape',
      'audio/tak': '.tak',
      'audio/tta': '.tta',
      'audio/gsm': '.gsm',
      'audio/voc': '.voc'
    };
    return extensions[mimeType] || '.tmp';
  }

  private executeFFmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if we're in a simulated environment
      if (process.env.NODE_ENV === 'development' && !this.isFFmpegAvailable()) {
        // Simulate processing delay for development
        setTimeout(() => {
          reject(new Error('FFmpeg not available in development environment. This feature requires FFmpeg installation on the server.'));
        }, 2000);
        return;
      }

      const ffmpeg = spawn('ffmpeg', args);
      let stderr = '';

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}: ${stderr}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(new Error(`FFmpeg error: ${error.message}`));
      });
    });
  }

  private isFFmpegAvailable(): boolean {
    try {
      // Try to spawn ffmpeg with version flag
      const ffmpeg = spawn('ffmpeg', ['-version']);
      return true;
    } catch {
      return false;
    }
  }

  private async cleanup(paths: string[]): Promise<void> {
    for (const filePath of paths) {
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
      } catch {
        // File doesn't exist or already deleted
      }
    }
  }

  async getMediaInfo(inputBuffer: Buffer, inputFormat: string): Promise<any> {
    const inputId = nanoid();
    const inputExt = this.getInputExtension(inputFormat);
    const inputPath = path.join(this.tempDir, `${inputId}${inputExt}`);

    try {
      await fs.writeFile(inputPath, inputBuffer);

      return new Promise((resolve, reject) => {
        const ffprobe = spawn('ffprobe', [
          '-v', 'quiet',
          '-print_format', 'json',
          '-show_format',
          '-show_streams',
          inputPath
        ]);

        let stdout = '';
        let stderr = '';

        ffprobe.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        ffprobe.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        ffprobe.on('close', async (code) => {
          await this.cleanup([inputPath]);
          
          if (code === 0) {
            try {
              const info = JSON.parse(stdout);
              resolve(info);
            } catch (error) {
              reject(new Error('Failed to parse media info'));
            }
          } else {
            reject(new Error(`FFprobe failed: ${stderr}`));
          }
        });

        ffprobe.on('error', async (error) => {
          await this.cleanup([inputPath]);
          reject(new Error(`FFprobe error: ${error.message}`));
        });
      });
    } catch (error) {
      await this.cleanup([inputPath]);
      throw error;
    }
  }
}

export const mediaService = new MediaService();