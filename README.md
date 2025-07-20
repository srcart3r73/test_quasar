# Test Quasar Project to Access RCREDB

A Quasar Vue.js frontend application for managing real estate transactions, connected to a FastAPI backend with PostgreSQL database.

## ✨ Features

- 🚀 **Quasar Framework** - Vue.js with Material Design components
- 🏢 **Transactions Management** - Complete CRUD operations for real estate transactions  
- 🏗️ **Buildings Management** - Link buildings to transactions with relationship management
- 📊 **Interactive DataTable** - Inline editing with double-click to edit
- 📱 **Responsive Design** - Side panel layout that adapts to screen size
- 🔍 **Search & Filter** - Real-time search across transaction fields
- 🎨 **Modern UI** - Clean Material Design interface

## 🏗️ Architecture

- **Frontend**: Quasar (Vue.js) - This repository
- **Backend**: FastAPI with PostgreSQL
- **Database Tables**: 
  - `transactions` - Real estate transaction records
  - `buildings` - Building/property information  
  - `link_transactions_buildings` - Many-to-many relationship table

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API endpoints

The app supports different environments:

**For production (default):**
```bash
# Uses .env file with production API
API_BASE_URL=https://rc-api-re.onrender.com
```

**For local development:**
```bash
# Create .env.local for local FastAPI server
echo "API_BASE_URL=http://localhost:8000" > .env.local
```

### 3. Start development server

```bash
npm run dev
```

🎉 **Navigate to `/transactions` to manage your real estate data!**

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run lint         # Lint code
npm run format       # Format code
```

## 🎯 Usage

### Transactions Table (Left Panel)
- **View**: All transactions with sortable columns
- **Edit**: Double-click any field to edit inline
- **Add**: Click "Add Transaction" to create new records
- **Delete**: Select transactions and bulk delete, or delete individually
- **Search**: Real-time search across name, notes, and description

### Buildings Panel (Right Side)  
- **Select Transaction**: Click any transaction to view its linked buildings
- **Link Buildings**: Use "Link Building" button to associate buildings
- **Unlink**: Remove building associations
- **View Details**: See all building information in organized table

### Key Features
- **Inline Editing**: Double-click fields to edit, press Enter or blur to save
- **Relationship Management**: Visual linking between transactions and buildings
- **Responsive Layout**: Adapts to mobile and desktop screens
- **Error Handling**: User-friendly error messages for API issues
- **Loading States**: Visual feedback during data operations

## 🛠️ API Integration

The application expects these FastAPI endpoints:

### Transactions
- `GET /transactions` - List all transactions
- `GET /transactions/{id}` - Get single transaction  
- `POST /transactions` - Create new transaction
- `PUT /transactions/{id}` - Update transaction
- `DELETE /transactions/{id}` - Delete transaction

### Buildings
- `GET /buildings` - List all buildings
- `GET /buildings/{id}` - Get single building
- `POST /buildings` - Create new building
- `PUT /buildings/{id}` - Update building  
- `DELETE /buildings/{id}` - Delete building

### Links
- `GET /link_transactions_buildings` - List all links
- `POST /link_transactions_buildings` - Create new link
- `DELETE /link_transactions_buildings/{id}` - Delete link

## 🎨 Customization

### Adding Fields
1. Update the API service in `src/services/api.js`
2. Add columns to table configuration in `TransactionsPage.vue`
3. Add inline editing templates for new fields

### Styling
- Global styles: `src/css/app.scss`
- Component styles: `<style scoped>` sections
- Quasar variables: `src/css/quasar.variables.scss`

### API Configuration
- Environment variables in `.env` and `.env.local`
- API service layer in `src/services/api.js`
- Error handling and response formatting included

## 📖 Documentation

- **[Quasar Documentation](https://quasar.dev)** - UI Framework
- **[FastAPI Documentation](https://fastapi.tiangolo.com)** - Backend API
- **[Vue.js Documentation](https://vuejs.org)** - Frontend Framework
