const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const taskRoutes = require('./routes/taskRoutes');
const authRouter = require('./routes/auth-routes');

dotenv.config();

const app = express();

// CORS config
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// ✅ Serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ FIX: mount tasks router under /api/tasks
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRouter);

// MongoDB connection
mongoose
  .connect('mongodb://127.0.0.1:27017/taskDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
