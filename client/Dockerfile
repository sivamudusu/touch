# Use Node.js image to build the React app
FROM node:18 

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application and build it
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
