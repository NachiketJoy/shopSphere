
# SIT725 Group Project
- Term: T3/2024
- Project: ShopSphere
- Team member
    - Chloe Cheng - s222113273
    - Hue Minh Nguyen - s220466717
    - Nachiket Joyekurun - s224794365
    - William Yip - s224767929


### Tech Stack
- Frontend: HTML, CSS, JS, and Materialize CSS
- Backend: NodeJS, ExpressJS
- Database: MongoDB
- View Engine: EJS (Embedded JavaScript)
- Architecture: MVC(Model-View-Controller) Pattern
- Authentication: JWT


### Authentication: 
- Admin don't register: already have a provided email and password (password can be changed by admin)
- Admin upon login, redirect to dashboard directly, link to view website
- User will need to register - to login
- User cant access dashboard

### Env Variables

Create a .env file in then root and add the following

```

.env:
MONGODB_URI = you can use the same as the previous one
SECRET_KEY = 'shopSphere'
PORT = 3002
ADMIN_PASSWORD = '12345'
ADMIN_LOGIN_EMAIL = 'admin@example.com

```

## Install Dependencies

```
npm install

```

## Run App

```

# Run in dev mode

npm run start

```