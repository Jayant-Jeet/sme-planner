# SME Planner

A comprehensive Angular application for managing Subject Matter Expert (SME) scheduling and effort tracking. This application provides a user-friendly interface for planning, scheduling, and monitoring SME activities across different projects and teams.

## 🚀 Features

- **User Authentication**: Secure login system with role-based access control
- **SME Management**: Search and manage Subject Matter Experts
- **Schedule Planning**: Create, update, and manage SME schedules with time slots
- **Effort Tracking**: Track and monitor effort allocation for SMEs, Supervisors, and Leads
- **Activity Management**: Organize work into different activities and projects
- **Dashboard**: Comprehensive overview of schedules, availability, and effort data
- **Responsive Design**: Material Design UI components for optimal user experience

## 🛠️ Technology Stack

- **Frontend Framework**: Angular 20.0.0
- **UI Components**: Angular Material 20.0.5
- **Language**: TypeScript 5.8.2
- **Styling**: SCSS
- **State Management**: RxJS 7.8.0
- **Testing**: Jasmine & Karma
- **Build Tool**: Angular CLI 20.0.5

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Angular CLI](https://angular.io/cli) (optional but recommended)

## 🚀 Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sme-planner
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**

   Navigate to `http://localhost:4200/`

### Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the project for production
- `npm run watch` - Build the project and watch for changes
- `npm test` - Run unit tests
- `npm run ng` - Run Angular CLI commands

## 🏗️ Project Structure

```text
src/
├── app/
│   ├── components/          # Angular components
│   │   ├── dashboard/       # Main dashboard component
│   │   ├── login/          # Authentication component
│   │   ├── schedule-form/   # Schedule creation form
│   │   ├── sme-search/     # SME search functionality
│   │   ├── effort-dialog/   # Effort tracking dialogs
│   │   └── ...             # Other components
│   ├── models/             # TypeScript interfaces and models
│   ├── services/           # Angular services (API, Auth)
│   └── environments/       # Environment configurations
├── assets/                 # Static assets (images, icons)
└── styles.scss            # Global styles
```

## 🔧 Key Components

### Dashboard

The main interface providing:

- Schedule overview and management
- SME availability tracking
- Effort reporting and analytics
- Quick access to all major features

### Authentication

- Secure login system
- Role-based access control
- Session management

### Schedule Management

- Create and edit SME schedules
- Time slot management
- Availability tracking
- Conflict detection

### Effort Tracking

- Monitor SME effort allocation
- Track supervisor and lead activities
- Generate effort reports
- Data visualization

## 🔌 API Integration

The application integrates with backend APIs for:

- User authentication and authorization
- SME data management
- Schedule and availability operations
- Effort tracking and reporting

API models are defined in `src/app/models/api.models.ts` with interfaces for:

- `SME` - Subject Matter Expert data
- `Schedule` - Scheduling information
- `Activity` - Work activities and projects
- `Supervisor` & `Lead` - Management roles
- `EffortData` - Effort tracking metrics

## 🎨 UI/UX Design

The application uses Angular Material Design components for:

- Consistent and modern UI
- Responsive layout across devices
- Accessibility compliance
- Professional appearance

### Key Material Components Used

- Material Toolbar and Navigation
- Material Cards and Tables
- Material Forms and Dialogs
- Material Icons and Buttons
- Material Snackbars for notifications

## 🧪 Testing

Run the test suite with:

```bash
npm test
```

The project includes:

- Unit tests for components and services
- Karma test runner configuration
- Jasmine testing framework
- Code coverage reports

## 🏗️ Building for Production

Create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🔒 Security

- Secure authentication implementation
- Role-based access control
- Input validation and sanitization
- HTTPS ready for production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Style

The project uses:

- Prettier for code formatting
- TypeScript strict mode
- Angular style guide conventions
- SCSS for styling

## 🔧 Configuration

### Environment Configuration

- Development environment: `src/environments/environment.ts`
- Production environment: `src/environments/environment.prod.ts`

### Angular Configuration

- `angular.json` - Angular workspace configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

## 📄 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ by jjtomar
