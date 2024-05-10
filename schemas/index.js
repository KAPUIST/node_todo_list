import mongoose from 'mongoose';

const connect = () => {
  mongoose
    .connect(
      'mongodb+srv://luke:thswldud7@express-monmon.qaiu3jo.mongodb.net/?retryWrites=true&w=majority&appName=express-monmon',
      {
        dbName: 'todo_memo',
      }
    )
    .then(() => console.log('몽고디비 연결 성공'))
    .catch((error) => console.log(`몽고디비 연결 실패 : ${error}`));
};
export default connect;
