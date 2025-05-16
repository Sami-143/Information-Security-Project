# 🚘 License Plate Detection System

A web-based AI-powered system for real-time license plate detection using deep learning and computer vision, integrated with modern security measures for safe and reliable vehicle identification.

---

## 🔍 Overview

This project leverages advanced computer vision techniques and machine learning models (YOLOv8) to detect and read license plates from vehicle images or live streams. Built with a secure backend and responsive frontend, it ensures both usability and protection in real-time deployments.

---

## ⚙️ Features

- 🔍 **Real-time License Plate Detection** using YOLOv8
- 🤖 **Optical Character Recognition (OCR)** with EasyOCR
- 🖥️ **Live Camera Stream Support**
- 💾 **Image Upload and Processing**
- 🔐 **JWT Authentication** for secure user access
- 👮 **Role-Based Access Control** (Admin/User)
- 📦 **FastAPI Backend** for robust performance
- 🌐 **React Frontend** with TailwindCSS
- 🧠 **MongoDB** for secure data storage
- 🛡️ **Security Measures**: CORS handling, HTTPS-ready backend, password hashing, token validation

---

## 🧠 Tech Stack

| Frontend     | Backend     | ML & CV       | Database  | Security        |
|--------------|-------------|---------------|-----------|-----------------|
| React.js     | FastAPI     | YOLOv8        | MongoDB   | JWT Auth        |
| TailwindCSS  | Python      | EasyOCR       | Beanie ODM| Role-based Auth |
| Axios        | Uvicorn     | OpenCV        |           | CORS Middleware |

---

## 🖼️ Screenshots

> *Add relevant screenshots of your UI, detection result, and admin panel here*

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


cd frontend
npm install
npm run dev

```

## Usage
Visit the homepage.

- Sign up and log in with a secure token.
- Upload an image or use the live camera feature.
- Get the detected license plate with OCR output.
- Admins can monitor all user detections.


## Security Highlights
- JWT-based token authentication for secure endpoints
- Role-based user access (admin/user)
- Passwords hashed and salted using bcrypt
- CORS middleware to prevent cross-origin attacks
- Input validation for OCR and uploads

## Author
Sami Ullah
2022-CS-143
📧 samiullahglotar420@gmail.com

## License
This project is licensed under the MIT License - see the LICENSE file for details.

