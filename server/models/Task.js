import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false }); 

const taskGroupSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  tasks: {
    type: [String],
    required: true
  },
  status: {
    type: Boolean,
    default: false
  },
  resources: {
    type: [resourceSchema], 
    default: []
  },
  calendarEventIds: {
  type: [String],
  default: []
},

});

export default taskGroupSchema;
