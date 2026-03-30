import axios from 'axios';
import { cache } from '../utils/cache';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ChatService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      timeout: 10000
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async getChats() {
    try {
      const cacheKey = 'chats';
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const response = await this.api.get('/chats');
      cache.set(cacheKey, response.data, 30000); // Cache for 30 seconds
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMessages(chatId, page = 1, limit = 50) {
    try {
      const cacheKey = `messages_${chatId}_${page}`;
      const cached = cache.get(cacheKey);
      if (cached && page === 1) return cached;

      const response = await this.api.get(`/chats/${chatId}/messages`, {
        params: { page, limit }
      });
      
      if (page === 1) {
        cache.set(cacheKey, response.data, 30000);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPrivateChat(userId) {
    try {
      const response = await this.api.post(`/chats/private/${userId}`);
      // Invalidate chats cache
      cache.delete('chats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendMessage(chatId, text, replyTo = null) {
    try {
      const response = await this.api.post(`/chats/${chatId}/messages`, {
        text,
        replyTo
      });
      
      // Invalidate messages cache for this chat
      cache.deletePattern(`messages_${chatId}`);
      cache.delete('chats');
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markAsRead(chatId, messageIds) {
    try {
      const response = await this.api.put(`/chats/${chatId}/read`, { messageIds });
      cache.deletePattern(`messages_${chatId}`);
      cache.delete('chats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteMessage(chatId, messageId) {
    try {
      const response = await this.api.delete(`/chats/${chatId}/messages/${messageId}`);
      cache.deletePattern(`messages_${chatId}`);
      cache.delete('chats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.error || 'Server error',
        data: error.response.data
      };
    }
    return {
      status: 500,
      message: error.message || 'Network error',
      data: null
    };
  }
}

export const chatService = new ChatService();