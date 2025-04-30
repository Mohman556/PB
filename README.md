# Workout Tracker - MacroLanks 

A full-stack fitness tracking application with planned cloud integration for scalability, reliability, and advanced features.

## 🌟 Features

- **User Authentication System**
  - Secure login/signup with JWT authentication
  - Complete profile management

- **Exercise Library**
  - Comprehensive exercise database
  - Categorization by muscle group and exercise type
  - Searchable and filterable interface

- **Workout Planning & Logging**
  - Create and save custom workout routines
  - Schedule workouts on a calendar
  - Log sets, reps, and weights for each exercise
  - Built-in rest timer functionality

### Planned Cloud Features (Coming Soon)
- **Cloud Authentication Integration**
  - Firebase Authentication/AWS Cognito integration

- **Progress Tracking with Cloud Visualization**
  - Interactive charts and graphs
  - Performance metrics and PR tracking
  - Body measurement tracking
  - Automated performance reports via serverless functions

- **Additional Cloud-Powered Features**
  - Progress photo upload and comparison
  - Push notifications for workouts and achievements
  - Data backup and export capabilities
  - Advanced analytics and insights

## 🏗️ Tech Stack

### Backend
- Django & Django REST Framework
- PostgreSQL (local development, cloud database planned)

### Frontend
- React.js
- Redux for state management
- Chart.js/D3.js for visualizations

### Future Cloud Integration (Planned)
- AWS/Google Cloud for hosting and database
- Cloud Storage (AWS S3/Google Cloud Storage) for media files
- Serverless functions for report generation
- CDN for static assets
- Cloud-based notifications

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/workout-tracker.git
   cd workout-tracker/backend
   ```

2. Create a virtual environment and activate it
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. Run migrations
   ```bash
   python manage.py migrate
   ```

6. Start the development server
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd ../frontend
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure API endpoints
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL
   ```

4. Start the development server
   ```bash
   npm start
   # or
   yarn start
   ```

## 🌩️ Deployment

### Current Deployment Options

1. Build the React application
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy using your preferred method (local server, traditional hosting)

### Future Cloud Deployment (Coming Soon)

The project roadmap includes plans for cloud deployment with:
- AWS Elastic Beanstalk or Google App Engine for backend
- AWS Amplify or Firebase Hosting for frontend
- Complete CI/CD pipeline integration

Detailed cloud deployment instructions will be added when these features are implemented.

## 🧪 Testing

Run backend tests:
```bash
python manage.py test
```

Run frontend tests:
```bash
npm test
# or
yarn test
```

## 📊 Project Structure

```
workout-tracker/
├── backend/                      # Django backend
│   ├── workout_tracker/          # Main Django project
│   ├── users/                    # User authentication app
│   ├── exercises/                # Exercise management app
│   ├── workouts/                 # Workout tracking app
│   └── progress/                 # Progress tracking app
│
├── frontend/                     # React frontend
│   ├── public/                   # Static files
│   ├── src/                      # Source files
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── redux/                # Redux state management
│   │   ├── services/             # API service calls
│   │   └── utils/                # Utility functions
│   │
│   ├── package.json              # npm dependencies
│   └── README.md                 # Frontend specific README
│
├── docs/                         # Documentation
│   └── cloud_integration_plan.md # Future cloud integration plan
│
└── README.md                     # This file
```

Note: The `cloud_services` app and `infrastructure` directory will be added in future releases when cloud integration is implemented.

## 🔄 Development Workflow

This project follows a 5-phase development approach:

### Current Development Phase

1. **Project Setup and Architecture**
   - Backend/frontend initialization
   - Database design
   - Basic application architecture

2. **Core Feature Implementation**
   - Authentication system
   - Exercise library
   - Workout planning & logging
   - Progress tracking

### Future Development Phases

3. **Testing & Cloud Integration**
   - Unit and integration testing
   - Cloud service configuration
   - Cloud deployment setup
   - CI/CD pipeline implementation

4. **Cloud-Powered Features**
   - Image upload and processing
   - Notifications
   - Data backup
   - Monitoring

5. **Scaling and Optimization**
   - Performance improvements
   - Security hardening

## 🔒 Security Features

### Current Security Implementation
- JWT authentication
- HTTPS enforcement

### Planned Cloud Security Features
- Proper IAM roles and permissions
- Web Application Firewall protection
- Database encryption
- Advanced security monitoring


## 📧 Contact

Mohamed Abdalla - [mohameda.bzns@gmail.com](mailto:mohameda.bzns@gmail.com)

Project Link: [https://github.com/Mohman556/PB](https://github.com/Mohman556/PB)
