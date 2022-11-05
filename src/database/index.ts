import mongoose from 'mongoose';

export class Database {
  connect = async () =>
    mongoose
      .connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rvngy0r.mongodb.net/?retryWrites=true&w=majority`
      )
      .then(() => console.log('🍺 Database connection established'))
      .catch((e) => console.error('Error connecting database', e.message));
}
