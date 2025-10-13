

# Property Management System

A full-stack web application for managing people, landlords, buildings, and rooms with comprehensive CRUD operations and relationship management.

## Features

### Core Functionality
- **People Management**: Full CRUD operations for managing people with schedules
- **Building Management**: Complete building and room management with flexible room configurations
- **Landlord Management**: Landlord registration and building association management with cascading delete functionality
- **Responsive UI**: Clean, user-friendly interface with modal dialogs, enhanced dropdown styling, and responsive form layouts
- **Data Validation**: Comprehensive input validation and error handling
- **Cascading Delete Operations**: Safe delete operations with automatic cleanup of related data (landlords → buildings → rooms)
- **Enhanced Styling**: Custom dropdown arrows, responsive two-column form layouts, and consistent UI elements

### Technical Features
- **SQLite Database**: Persistent data storage with proper relationships and cascade deletes
- **RESTful API**: Clean API endpoints for all CRUD operations including DELETE with validation
- **Responsive UI**: Modern, mobile-first design with CSS Grid/Flexbox and interactive action columns
- **Comprehensive Testing**: 112+ tests with 97%+ coverage using Jest (including delete operations)
- **Code Quality**: ESLint configuration with consistent style enforcement
- **Modern JavaScript**: ES6+ features with proper error handling and custom modal dialogs

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation & Running

```bash
# Install dependencies
npm install

# Initialize database with schema and comprehensive dummy data
node lib/init-database.js

# Start the application
npm start

# Visit http://localhost:3000 in your browser
```

The database initialization includes realistic dummy data with 8 people, 6 landlords, 10 buildings, and 40+ rooms with detailed descriptions to help you explore the application immediately.

Then open your browser to `http://localhost:3000`

## Development

### Available Scripts

```bash
# Development
npm start              # Start the server
npm run lint          # Check code style and quality
npm run lint:fix      # Automatically fix linting issues

# Testing
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Project Structure

```
├── index.js                 # Main server file
├── lib/                     # Backend modules
│   ├── api.js              # API route handler
│   ├── database.js         # Database connection and helpers
│   ├── people.js           # People management logic
│   ├── landlords.js        # Landlords management logic
│   ├── buildings.js        # Buildings and rooms logic
│   └── init-database.js    # Database initialization with sample data
├── public/                  # Frontend assets
│   ├── index.html          # Main HTML file
│   ├── css/styles.css      # Styling
│   └── js/                 # Frontend JavaScript modules
├── tests/                   # Test suite
│   ├── *.test.js           # Test files for each module
│   ├── test-helpers.js     # Test utilities
│   └── setup.js            # Test configuration
└── TESTING.md              # Detailed testing documentation
```

## API Endpoints

### People
- `GET /api/people` - Get all people
- `PUT /api/people` - Add or update a person
- `DELETE /api/people` - Delete a person (with cascade handling)
- `PUT /api/people/schedule` - Update person's schedule

### Landlords
- `GET /api/landlords` - Get all landlords
- `PUT /api/landlords` - Add or update a landlord
- `DELETE /api/landlords` - Delete a landlord (with cascade handling)
- `PUT /api/landlords/building` - Associate building with landlord

### Buildings
- `GET /api/buildings` - Get all buildings with rooms
- `PUT /api/buildings` - Add or update a building
- `DELETE /api/buildings` - Delete a building (with cascade handling)
- `PUT /api/buildings/room` - Add room to building
- `PUT /api/buildings/room/update` - Update existing room
- `PUT /api/buildings/room/delete` - Remove room from building

## Database Schema

The application uses SQLite with the following main tables:
- **people**: User profiles with schedules
- **landlords**: Property owner information
- **buildings**: Property details with landlord relationships
- **rooms**: Individual rooms within buildings

## Testing

This project includes a comprehensive test suite with:
- **99 tests** covering all backend functionality
- **97%+ code coverage** for business logic
- **Integration tests** with real database operations
- **Isolated test databases** for reliable testing

See [TESTING.md](TESTING.md) for detailed testing documentation and guidelines.

## Code Quality

- **ESLint**: Strict linting rules for consistent code style
- **Error Handling**: Comprehensive error handling throughout the application
- **Documentation**: JSDoc comments and clear code structure
- **Best Practices**: Modern JavaScript patterns and proper separation of concerns

## Implementation Highlights

This project demonstrates:

✅ **Complete Full-Stack Implementation**: Frontend, backend, and database integration  
✅ **Professional Testing**: Comprehensive test suite with high coverage  
✅ **Clean Architecture**: Modular design with clear separation of concerns  
✅ **Database Design**: Proper relational database with foreign keys  
✅ **API Design**: RESTful endpoints with proper HTTP methods  
✅ **Code Quality**: ESLint configuration and consistent style  
✅ **Documentation**: Comprehensive README and testing documentation  
✅ **Error Handling**: Robust error handling and validation  

## Future Enhancements

Potential areas for expansion:
- User authentication and authorization
- Advanced search and filtering capabilities
- File upload for property images
- Reporting and analytics features
- Mobile-responsive design improvements
- Real-time updates with WebSockets
