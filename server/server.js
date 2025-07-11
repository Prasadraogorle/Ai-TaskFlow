const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');
const authRouter = require('./routes/auth-routes')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser');
const app = express();
dotenv.config()
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// ✅ Serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRouter)


// MongoDB connection
mongoose
  .connect('mongodb://127.0.0.1:27017/taskDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch((err) => {
    console.error(err);
  });

