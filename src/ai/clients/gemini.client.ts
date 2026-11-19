import { Injectable } from '@nestjs/common';
import { GeminiRequest } from '../types/gemini-request.js';
import axios, { AxiosResponse } from 'axios';
import { GeminiResponse } from '../types/gemini-response.js';
import { GEMINI_URL } from '../constants/ai.constants.js';

@Injectable()
export class GeminiClient {
  async generateContent(request: GeminiRequest): Promise<string> {
    const response: AxiosResponse<GeminiResponse> =
      await axios.post<GeminiResponse>(GEMINI_URL, request);

    return response.data.candidates[0].content.parts[0].text;
  }
}
