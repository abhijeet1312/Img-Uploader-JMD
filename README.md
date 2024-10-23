# Assignment Uploader 
A Node.js application that allows users to register, log in, and upload their social handle and multiple images. Admins can see these photos and social handles .  


## Table of Contents  

- [Installation](#installation)  
- [Usage](#usage)  
- [Features](#features)  


## Installation  

1. **Clone the repository:**  

  
   git clone https://github.com/abhijeet1312/Img-Uploader-JMD.git  
   cd Img-Uploader-JMD
2. **Install dependencies:**
     npm install

## Usage
 1. To start this project on your local computer run the following command on your terminal after moving to the root directory:
    **npm start**
 
   2. **Environment Variables**
Before running the application, you need to set up the necessary environment variables for it to function correctly. Below are the following  variable:


- **SESSION_SECRET**: Variable which holds the session secret of session middleware
- **JWT_SECRET**:Variable which holds the session secret of JWT
- **MONGODB-URI**:Url which connects our server to MongoDB ,we can get this using mongodb compass or atlas
- **PORT**:sample port
## API Routes  

### For **User**, the following are the routes:  
- **POST** `"/register"`: Route to register the User.  
- **POST** `"/loginUser"`: Route to login the User.  
- **POST** `"/user-upload"`: Route to submit the User social handle and multiple images.  
 

### For **Admin**, the following are the routes:  
- **POST** `"/registerA"`: Route to register the Admin.  
- **POST** `"/loginAdminMain"`: Route to login the Admin.  
- **GET** `"/users-data"`: Route to fetch and display all users' data (Social media posts/images).  
- **POST** `"/user/:id"`: Route to display the details of a single user by ID 

   
    
   
