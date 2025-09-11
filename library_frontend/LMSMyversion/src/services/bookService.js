import api from '../config/api';

export const bookService = {
  // Get all books with optional filters
  async getBooks(params = {}) {
    const response = await api.get('/books', { params });
    return response.data;
  },

  // Get single book by ID
  async getBook(id) {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  // Create new book
  async createBook(bookData) {
    const response = await api.post('/books', bookData);
    return response.data;
  },

  // Update book
  async updateBook(id, bookData) {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  },

  // Delete book
  async deleteBook(id) {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },

  // Get featured books
  async getFeaturedBooks() {
    const response = await api.get('/featured-books');
    return response.data;
  },

  // Add book to featured
  async addToFeatured(bookId) {
    const response = await api.post(`/featured-books/${bookId}/add`);
    return response.data;
  },

  // Remove from featured
  async removeFromFeatured(featuredId) {
    const response = await api.delete(`/featured-books/${featuredId}`);
    return response.data;
  },
};