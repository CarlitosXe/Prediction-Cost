# Healthcare Cost Transparency System

## 🏥 Overview
A healthcare cost prediction system consisting of two main components: a **REST API** for machine learning predictions and a **web application** for user interface and data management. The API provides accurate treatment cost estimation and medical procedure classification using advanced ML algorithms, while the web application (developed using waterfall methodology) offers a complete healthcare management interface.

## 🎯 Key Features

### 🤖 REST API (Prediction Service)
- **Cost Prediction**: Utilizes LightGBM algorithm to predict medical treatment costs
- **Medical Action Classification**: Employs Random Forest algorithm to classify required medical procedures
- **Real-time Processing**: High-performance .NET Core C# API for instant predictions
- **ONNX Model Integration**: Optimized model deployment and inference

### 🌐 Web Application (Healthcare Management System)
- **Complete Healthcare Interface**: Comprehensive web application built with Next.js and TypeScript
- **User Management**: Secure login system for medical personnel
- **Prediction Dashboard**: Interface to consume API predictions
- **ICD Management**: Full CRUD operations for ICD code database
- **Prediction History**: Track and review previous cost predictions
- **Waterfall Development**: Systematic development approach ensuring reliability

## 🛠️ Technology Stack

### Backend
- **.NET Core C#** - High-performance REST API
- **LightGBM** - Machine learning for cost prediction
- **Random Forest** - Medical procedure classification
- **ONNX** - Model serialization and deployment

### Frontend
- **Next.js** - React-based web framework
- **TypeScript** - Type-safe JavaScript development
- **Responsive Design** - Mobile-friendly interface

### Machine Learning
- **LightGBM** - Gradient boosting for cost prediction
- **Random Forest** - Ensemble learning for classification
- **Historical Data Analysis** - Patient data from 2020-2023

## 📊 System Architecture
The system consists of two independent but integrated components:

### 🔧 REST API (Prediction Service)
- **Focused Purpose**: Exclusively handles ML predictions
- **ML Models**: LightGBM for cost prediction, Random Forest for classification
- **ONNX Integration**: Optimized model serving and inference
- **Stateless Design**: Pure prediction service without data persistence

### 🌐 Web Application (Management System)
- **Waterfall Development**: Systematic approach with clear phases
- **Complete Interface**: Full healthcare management system
- **API Integration**: Consumes prediction API for ML functionality
- **Data Management**: Handles user authentication, history, and ICD management

## 🔧 API Endpoints (Prediction Service Only)

### Cost Prediction
```
POST /CpCost
```
Accepts patient medical data and returns accurate cost estimates using LightGBM.

### Medical Classification  
```
POST /CpClasif
```
Processes medical data and provides medical action recommendations using Random Forest.

**Note**: API is stateless and focused solely on prediction tasks. No data storage or user management.

## 📋 Input Parameters
- **Primary ICD**: Main diagnosis code
- **Secondary ICD**: Additional diagnosis codes (up to 3)
- **Length of Stay**: Hospitalization duration in days
- **Patient Type**: General or special program patient
- **Referral Code**: Patient referral origin identifier

## 🎨 User Interface
- **Login Page**: Secure authentication for medical personnel
- **Prediction Dashboard**: Main interface for cost estimation
- **History Management**: View and track previous predictions
- **ICD Management**: Comprehensive ICD code database with CRUD operations

## 🔍 Key Innovations
1. **Microservice Architecture**: Separate API service focused purely on ML predictions
2. **Dual-Model Approach**: LightGBM for cost prediction, Random Forest for classification
3. **Explainable AI**: Transparent and interpretable prediction results
4. **Waterfall Web Development**: Systematic development ensuring reliability and maintainability
5. **Service Integration**: Seamless communication between prediction API and web application
6. **ONNX Optimization**: Efficient model deployment and inference

## 📈 Benefits
- **For Patients**: Better financial planning with accurate cost estimates
- **For Hospitals**: Improved budget management and operational efficiency
- **For Medical Staff**: Data-driven decision making for treatment planning
- **For Healthcare System**: Enhanced transparency and cost management

## 🚀 Getting Started

### API Service (Prediction)
1. Clone the API repository
2. Set up .NET Core environment
3. Load trained ML models (ONNX format)
4. Configure API endpoints
5. Run the prediction service

### Web Application (Management System)
1. Clone the web application repository
2. Set up Next.js environment
3. Configure API integration endpoints
4. Set up database for user management and history
5. Run the web application

### Integration
- Web application consumes API predictions through HTTP requests
- API remains stateless and focused on ML inference only

## 📊 Model Performance
The system demonstrates functional compliance with requirements through comprehensive testing, offering an explainable and scalable solution for healthcare cost management.

## 📚 Documentation
- Complete API documentation available via Postman
- User manual for web application
- Technical implementation guide
- Model training and deployment instructions

## 🤝 Contributing
This project was developed as part of academic research at University Diponegoro, Department of Informatics. Contributions and improvements are welcome.

## 📄 License
This project is developed for educational and research purposes.

## 👥 Team
- **Krisna Okky Widayat** - Backend Developer
- **Guruh Aryotejo** - Frontend Developer  
- **Abyan Setyaneva** - ML Engineer
- **Gigih Haidar Falah** - ML Engineer

## 🎓 Academic Context
This system was developed as part of coursework at University Diponegoro, applying theoretical knowledge to create a practical solution with real-world impact in healthcare services.

---

*Developed with ❤️ for better healthcare transparency and cost management*
