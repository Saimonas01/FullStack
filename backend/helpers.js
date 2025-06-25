import { getDB } from "./config/database.js";
import { ObjectId } from "mongodb";

export const increaseReputation = async (userId, amount) => {
  const db = getDB();
  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $inc: { reputation: amount } }
  );
};