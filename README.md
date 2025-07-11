# Healthcare Cost Transparency System

## 🏥 Overview
A comprehensive healthcare cost prediction system that combines machine learning algorithms with modern web technologies to provide accurate treatment cost estimation and medical procedure classification. This system addresses the critical need for transparency in healthcare costs, helping both patients and hospitals make informed financial decisions.

## 🎯 Key Features
- **Cost Prediction**: Utilizes LightGBM algorithm to predict medical treatment costs based on historical patient data
- **Medical Action Classification**: Employs Random Forest algorithm to classify required medical procedures
- **Real-time API**: RESTful API built with .NET Core C# for high-performance predictions
- **Modern Web Interface**: Responsive web application developed with Next.js and TypeScript
- **Comprehensive Data Analysis**: Processes ICD codes, treatment classifications, and hospitalization duration
- **User Management**: Secure login system for medical personnel
- **Prediction History**: Track and review previous cost predictions

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
The system follows a client-server architecture with clear separation of concerns:
- **API Layer**: RESTful endpoints for prediction and classification
- **ML Layer**: Trained models for cost estimation and medical action classification
- **Web Layer**: Interactive user interface for data input and result visualization
- **Data Layer**: Historical patient data processing and management

## 🔧 API Endpoints

### Cost Prediction
```
POST /CpCost
```
Accepts patient medical data and returns accurate cost estimates.

### Medical Classification  
```
POST /CpClasif
```
Processes medical data and provides medical action recommendations.

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
1. **Dual-Model Approach**: Combines LightGBM and Random Forest for comprehensive analysis
2. **Explainable AI**: Provides transparent and interpretable predictions
3. **Scalable Architecture**: Modular design for easy maintenance and updates
4. **Real-time Processing**: Instant predictions through optimized API calls
5. **Historical Learning**: Adaptive system that improves with hospital data evolution

## 📈 Benefits
- **For Patients**: Better financial planning with accurate cost estimates
- **For Hospitals**: Improved budget management and operational efficiency
- **For Medical Staff**: Data-driven decision making for treatment planning
- **For Healthcare System**: Enhanced transparency and cost management

## 🚀 Getting Started
1. Clone the repository
2. Set up the .NET Core API backend
3. Configure the Next.js frontend
4. Load trained ML models (ONNX format)
5. Configure database connection
6. Run the application

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
- **Abyan Setyaneva** - ML Enginerr
- **Gigih Haidar Falah** - ML Engineer

## 🎓 Academic Context
This system was developed as part of coursework at University Diponegoro, applying theoretical knowledge to create a practical solution with real-world impact in healthcare services.

---

*Developed with ❤️ for better healthcare transparency and cost management*
