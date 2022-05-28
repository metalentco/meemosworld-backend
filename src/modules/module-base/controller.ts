import { NextFunction, Request, Response } from "express";
import { createNewUser, findByField, getUserById, updateUser } from "./service";

export const find = async (req: Request, res: Response, next: NextFunction) => {
  // If a query string ?publicAddress=... is given, then filter results
  const { publicAddress } = req.query;
  const fieldName = "";
  try {
    let isFirstLogin = false;
    const users = await findByField(fieldName, <string>publicAddress);
    let user;
    if (!users.length) {
      user = await createNewUser(<string>publicAddress);
      isFirstLogin = true;
    }
    const response = {
      success: true,
      isFirstLogin,
      user: user || users[users.length - 1],
    };
    res.send(response);
  } catch (error) {
    const response = {
      success: false,
      error,
    };
    res.send(response);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }
    return res.send({
      success: true,
      user,
    });
  } catch (error) {
    return res.send({
      success: false,
      error,
    });
  }
};

export const updateUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const newUserInfo = {
      ...req.body,
    };
    await updateUser(userId, newUserInfo);
    const newUserUpdated = await getUserById(userId);
    return res.send({
      success: true,
      user: newUserUpdated,
    });
  } catch (error) {
    return res.send({
      success: false,
      error,
    });
  }
};
