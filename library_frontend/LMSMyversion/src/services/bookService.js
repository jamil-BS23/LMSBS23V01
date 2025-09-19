import api from '../config/api';

export const bookService = {
  // Get all books with optional filters
  async getBooks(params = {}) {
    const response = await api.get('/books', { params });
    return response.data;
  },

  // Admin: Get all books (requires admin token)
  async getAllAdminBooks(params = {}) {
    const response = await api.get('/books/all', { params });
    return response.data;
  },

  // Get single book by ID
  async getBook(id) {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  // Admin: Create new book (multipart form)
  async createBookAdmin(formData) {
    const response = await api.post('/books/all', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ✅ Admin: Update a book
  // async updateBookAdmin(id, bookData) {
  //   const response = await api.patch(`/books/all/${id}`, bookData);
  //   return response.data;
  // },


  async updateBookAdmin(id, bookData) {
    // Extract numeric part from id

    console.log("Book Data: ", bookData);
    const numericIdMatch = String(id).match(/\d+$/); // match digits at the end
    if (!numericIdMatch) throw new Error("Invalid book id");
  
    const numericId = Number(numericIdMatch[0]); // "16"
    
    // Make the PATCH request with numeric id
    const response = await api.patch(`/books/${numericId}`, bookData);
    console.log("Response: ", response);
    return response.data;
  },
  

  // Delete book
  async deleteBook(id) {

    console.log("Delete Book ID: ", id);

    const response = await api.delete(`/books/${id}`);
    return response.data;
  },

  // Featured books helpers
  async getFeaturedBooks() {
    const response = await api.get('/featured-books');
    return response.data;
  },

  async addToFeatured(bookId) {
    const response = await api.post(`/featured-books/${bookId}/add`);
    return response.data;
  },

  async removeFromFeatured(featuredId) {
    const response = await api.delete(`/featured-books/${featuredId}`);
    return response.data;
  },
};
