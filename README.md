# SkySoft Agency - Elite Web Development Platform

A full-stack web development platform built with React + TypeScript (Frontend) and PHP + MySQL (Backend). SkySoft is an elite agency platform designed to showcase projects, manage leads, and provide comprehensive CRM functionality.

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form management

### Backend
- **PHP 8+** with PSR standards
- **MySQL** with InnoDB engine
- **RESTful API** architecture
- **JWT Authentication**
- **PDO** for database operations
- **Middleware** for security and CORS

### Development Tools
- **ESLint** for code quality
- **TypeScript** for type safety
- **Vitest** for testing
- **PostCSS** for CSS processing

## 📁 Project Structure

```
skysoft/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   ├── contact/            # Contact form components
│   │   └── ...                 # Other UI components
│   ├── hooks/                   # Custom React hooks
│   │   └── useLeads.ts         # Lead management hook
│   ├── services/               # API services
│   │   └── apiService.ts       # Centralized API client
│   ├── pages/                  # Page components
│   └── ...                     # Other frontend files
├── api/                        # Backend source code
│   ├── config/                # Configuration files
│   ├── core/                   # Core classes
│   │   └── Database.php        # Database connection class
│   ├── controllers/            # API controllers
│   │   ├── AuthController.php  # Authentication
│   │   ├── LeadController.php  # Lead management
│   │   ├── ProjectController.php # Project management
│   │   └── CrmController.php   # CRM functionality
│   ├── middleware/             # Security middleware
│   │   ├── AuthMiddleware.php  # Authentication
│   │   ├── CorsMiddleware.php  # CORS handling
│   │   └── SecurityMiddleware.php # Security measures
│   ├── router/                 # API routing
│   │   └── Router.php          # Route handler
│   └── index.php               # API entry point
├── database/                   # Database files
│   └── scheme.sql              # Database schema
└── public/                     # Public assets
    └── robots.txt              # SEO configuration
```

## 🗄️ Database Schema

The application uses a comprehensive MySQL database with the following main tables:

- **categorias** - Project categories
- **proyectos** - Portfolio projects
- **servicios** - Services offered
- **testimonios** - Customer testimonials
- **leads** - Customer leads/inquiries
- **usuarios_admin** - Admin users
- **configuracion_cms** - Dynamic configuration

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- PHP 8+
- MySQL 8+
- Web server (Apache/Nginx)

### Frontend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd skysoft
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

### Backend Setup

1. Configure database:
```bash
# Import the database schema
mysql -u root -p < database/scheme.sql
```

2. Configure API environment:
```bash
cd api
cp .env.example .env
# Edit .env with your database credentials
```

3. Configure web server to point `/api` to the `api/` directory

4. Ensure proper permissions for uploads directory:
```bash
mkdir -p api/uploads
chmod 755 api/uploads
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost/api/v1
VITE_APP_NAME=SkySoft Agency
VITE_NODE_ENV=development
```

#### Backend (api/.env)
```env
DB_HOST=localhost
DB_NAME=skysoft_agency
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

### Web Server Configuration

For Apache, ensure the following modules are enabled:
- mod_rewrite
- mod_headers
- mod_deflate

The `.htaccess` file in the `api/` directory handles URL rewriting and security headers.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Lead Management
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create new lead
- `PUT /api/leads/{id}/status` - Update lead status
- `DELETE /api/leads/{id}` - Delete lead

### Project Management
- `GET /api/projects` - Get all projects
- `GET /api/projects/{id}` - Get single project
- `POST /api/projects` - Create project (auth required)
- `PUT /api/projects/{id}` - Update project (auth required)
- `DELETE /api/projects/{id}` - Delete project (auth required)

### CRM Dashboard
- `GET /api/crm/dashboard` - Get dashboard statistics
- `GET /api/crm/activity` - Get activity feed
- `GET /api/crm/performance` - Get performance metrics

## 🎯 Features

### Public Features
- **Portfolio Showcase** - Display projects with categories
- **Service Presentation** - Show services with pricing
- **Customer Testimonials** - Display client reviews
- **Contact Form** - Lead capture with service selection
- **SEO Optimization** - Dynamic meta tags and structured data

### Admin Features
- **Dashboard** - Comprehensive statistics and metrics
- **Lead Management** - Track and manage customer inquiries
- **Project CRUD** - Add, edit, and delete portfolio projects
- **User Management** - Admin user roles and permissions
- **Configuration** - Dynamic CMS settings
- **Activity Feed** - Recent system activities
- **Export Functionality** - Export leads and data

### Security Features
- **JWT Authentication** - Secure token-based auth
- **CORS Protection** - Cross-origin request security
- **Input Sanitization** - XSS and SQL injection prevention
- **Rate Limiting** - API abuse prevention
- **Security Headers** - Comprehensive HTTP security

## 🧪 Development

### Running Tests
```bash
npm run test
```

### Code Quality
```bash
npm run lint
npm run type-check
```

### Building for Production
```bash
npm run build
```

## 📱 Usage Examples

### Using the API Service

```typescript
import { apiService } from './services/apiService';

// Fetch projects
const projects = await apiService.getProjects();

// Create a lead
const lead = await apiService.createLead({
  nombre: 'John Doe',
  correo: 'john@example.com',
  mensaje: 'I need a website'
});

// Login
const auth = await apiService.login({
  email: 'admin@skysoft.com',
  password: 'password'
});
```

### Using the Leads Hook

```typescript
import { useLeads } from './hooks/useLeads';

function LeadManager() {
  const { leads, loading, error, createLead, updateLeadStatus } = useLeads();

  // Component logic...
}
```

## 🔐 Security Considerations

- Always use HTTPS in production
- Change default JWT secret key
- Implement proper database user permissions
- Regularly update dependencies
- Use environment variables for sensitive data
- Enable server-side input validation

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support and inquiries:
- Email: contact@skysoft.com
- Phone: +1 (555) 123-4567

---

**SkySoft Agency** - Building Digital Excellence
