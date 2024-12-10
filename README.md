# 🏢 Leave Management System  

A full-stack web application to manage leave requests for organizations! Employees can apply for casual or medical leaves, check their leave balances, and track their application status. Admins can manage leave requests efficiently. 🚀  

---

## ✨ Features  

### 🌟 Employee Features:  
- 📝 **Apply for Leaves**: Casual or Medical leaves.  
- 📊 **Check Leave Balances**: See available leave days.  
- 🔍 **Track Leave Applications**: View the history of approved, pending, or rejected leaves.  

### 🌟 Admin Features:  
- 🛠️ **Manage Leave Requests**: Approve or reject leave applications.  
- 🧾 **View All Leave Records**: Get a holistic view of employee leave data.  

---

## 🛠️ Tech Stack  

### Backend:  
- ⚡ **Express.js**  
- 💾 **MongoDB (Mongoose)**  
- 🔒 **JWT Authentication**  

### Frontend:  
- 🌐 **React.js**  
- 🛡️ **Axios** for API calls  
- 🎨 **CSS** for styling  

---

## 🚀 Installation  

1. Clone this repository:  
   ```bash  
   git clone https://github.com/Subramanian7986/leavemanagement.git
   ```  

2. Navigate to the project directory:  
   ```bash  
   cd leave-management-system  
   ```  

3. Install dependencies for the backend:  
   ```bash  
   cd backend  
   npm install  
   ```  

4. Start the backend server:  
   ```bash  
   npm start  
   ```  

5. Install dependencies for the frontend:  
   ```bash  
   cd frontend  
   npm install  
   ```  

6. Start the frontend server:  
   ```bash  
   npm start  
   ```  

---

## 📁 Project Structure  

### Backend (server folder):  
- **server.js**: API routes for leave applications and user management.  
- **models/User.js**: Schema for user data.  
- **models/LeaveApplication.js**: Schema for leave applications.  

### Frontend (client folder):  
- **components/Login.js**: Employee/Admin login page.  
- **components/Register.js**: User registration page.  
- **components/Dashboard.js**: Employee dashboard.  
- **components/ApplyLeave.js**: Leave application form.  
- **components/AdminPanel.js**: Admin panel for managing leave requests.  

---

## 📝 License  
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.  

---

Enjoy managing leaves seamlessly! ✨
