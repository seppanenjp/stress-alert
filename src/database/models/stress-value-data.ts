import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const StressValueDataSchema = new Schema({
  timestamp: Date,
  channelId: String,
  channelName: String,
  stressValues: Object,
});

export const StressValueData = mongoose.model(
  'StressValueData',
  StressValueDataSchema
);
