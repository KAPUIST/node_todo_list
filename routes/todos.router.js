import Todo from "../schemas/todo.schema.js";
import express from "express";
import Joi from "joi";
const router = express.Router();

const createTodoSchema = Joi.object({
  value: Joi.string().required().min(1).max(50),
});
// /routes/todos.router.js

/** 할 일 생성 API 리팩토링, 에러 처리 **/
router.post("/todos", async (req, res, next) => {
  try {
    // 클라이언트에게 전달받은 데이터를 검증합니다.
    const validateBody = await createTodoSchema.validateAsync(req.body);

    // 클라이언트에게 전달받은 value 데이터를 변수에 저장합니다.
    const { value } = validateBody;

    // Todo모델을 사용해, MongoDB에서 'order' 값이 가장 높은 '해야할 일'을 찾습니다.
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();

    // 'order' 값이 가장 높은 도큐멘트의 1을 추가하거나 없다면, 1을 할당합니다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // Todo모델을 이용해, 새로운 '해야할 일'을 생성합니다.
    const todo = new Todo({ value, order });

    // 생성한 '해야할 일'을 MongoDB에 저장합니다.
    await todo.save();

    return res.status(201).json({ todo });
  } catch (error) {
    next(error);
  }
});
router.get("/todos", async (req, res) => {
  const todos = await Todo.find().sort("-order").exec();
  return res.status(200).json({
    todos,
  });
});
router.patch("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const { order, done, value } = req.body;

  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res.status(404).json({
      errormessage: "존재하지 않는 할일 입니다.",
    });
  }
  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    currentTodo.order = order;
  }
  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }
  if (value) {
    currentTodo.value = value;
  }
  await currentTodo.save();
  return res.status(200).json({});
});
// routes/todos.router.js

/** 할 일 삭제 **/
router.delete("/todos/:todoId", async (req, res) => {
  // 삭제할 '해야할 일'의 ID 값을 가져옵니다.
  const { todoId } = req.params;

  // 삭제하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 todo 데이터입니다." });
  }

  // 조회된 '해야할 일'을 삭제합니다.
  await Todo.deleteOne({ _id: todoId }).exec();

  return res.status(200).json({});
});

export default router;
