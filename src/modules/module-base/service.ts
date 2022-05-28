// import { randomBytes } from 'crypto';
import { User } from "../../models";

import { db } from "../firebase";

import {
  doc,
  addDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
const serviceCollection = db.collection("[serviceName]");
const userCollection = db.collection("user");

export const findByField = async (fieldName: string, fieldValue: string) => {
  const serviceQuery = await serviceCollection
    .where(fieldName, "==", fieldValue)
    .get();
  const result: User[] = [];
  serviceQuery.forEach((snapshot: any) => {
    const user: any = {
      id: snapshot.ref.id,
      ...snapshot.data(),
    };
    result.push(user);
  });
  return result;
};

export const createNewUser = async (publicAddress: string) => {
  // Create new user
  const user = {
    publicAddress,
  };
  const userRef = await serviceCollection.doc().set(user);
  const newUser = {
    ...user,
    id: userRef.id,
  };
  return newUser;
};

export const updateUser = async (id: string, newUser: User) => {
  userCollection.doc(id.toLowerCase()).set({
    ...newUser,
  });
};

export const updateUserNonce = async (user: User) => {
  await updateUser(user.id, {
    ...user,
  });
};

export const getUserById = async (id: string) => {
  const userDoc = await userCollection.doc(id.toLowerCase()).get();
  if (!userDoc.exists) {
    return null;
  } else {
    return userDoc.data();
  }
};
