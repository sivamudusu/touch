# touch

A social networking platform with automated content moderation and context-based authentication system.


## Project Overview

The project is a social networking platform built using (PstgreSQL, Express.js, React.js, Node.js) stack. It incorporates two major features: an automated content moderation system and context-based authentication. These features are accompanied by common functionalities found in social media applications, such as profile creation, post creation and sharing, liking and commenting on posts, and following/unfollowing users.



### Context-Based Authentication

The platform implements context-based authentication to enhance user account security. It takes into consideration user location, IP address, and device information for authentication purposes. Users can conveniently manage their devices directly from the platform. To ensure data privacy, this information is encrypted using the AES algorithm and securely stored in the database.

In case of a suspicious login attempt, users are promptly notified via email and are required to confirm their identity to protect against unauthorized access.

### User Roles

There are three distinct user roles within the system:

1. Admin: The admin role manages the overall system, including moderator management, community management, content moderation, monitoring user activity, and more.
2. Moderators: Moderators manage communities, manually review reported posts, and perform other moderation-related tasks.
3. General Users: General users have the ability to make posts, like comments, and perform other actions within the platform.



## Features

- [x] User authentication and authorization (JWT)
- [x] User profile creation and management
- [x] Post creation and management
- [x] Commenting on posts
- [x] Liking posts and comments
- [x] Following/unfollowing users
- [x] Reporting posts
- [x] Context-based authentication


## Technologies

- React.js
- Redux
- Node.js
- Express.js
- MongoDB
- Tailwind CSS
- JWT Authentication
- Passport.js
- Nodemailer






## Getting Started

### Prerequisites

Before running the application, make sure you have the following installed:

- Node.js
- PstgreSQL and PGAdmin

### Installation

1. Clone the repository

```bash
git clone https://github.com/sivamudusu/touch.git
```
2. Go to the project directory and install dependencies for both the client and server

```bash
cd client
npm install
```

```bash
cd server
npm install
```

3. Create a `.env` file in both the `client` and `server` directories and add the environment variables as shown in the `.env.example` files.
4. Start the server

```bash
cd server
npm start
```

5. Start the client

```bash
cd client
npm start
```


### Configuration

Run the `admin_tool.sh` script from the server directory with permissions for executing the script. This script is used for configuring the admin account, creating the initial communities, and other settings.
```bash
./admin_tool.sh
``` 

#### `.env` Variables

For email service of context-based authentication, the following variables are required:

```bash
EMAIL=
PASSWORD=
EMAIL_SERVICE=
```


#### Demo
https://youtu.be/Tmncayg7FeU

## License

This project is licensed under the [MIT License](https://github.com/nz-m/SocialEcho/blob/main/LICENSE).
