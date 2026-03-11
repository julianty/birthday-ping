import { ObjectId } from "mongodb";
import { CreateGroup, GroupDB } from "../../schemas/group.schema";
import { clientPromise } from "./connection";

export async function createGroup(
  ownerId: ObjectId | string,
  groupData: CreateGroup,
): Promise<GroupDB> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");
  const groups = db.collection<GroupDB>("groups");

  const owner = typeof ownerId === "string" ? new ObjectId(ownerId) : ownerId;
  const now = new Date();
  const newGroup: Omit<GroupDB, "_id"> = {
    name: groupData.name,
    description: groupData.description,
    ownerId: owner,
    memberIds: [owner],
    createdAt: now,
    updatedAt: now,
  };

  const result = await groups.insertOne(newGroup as GroupDB);
  return {
    _id: result.insertedId,
    ...newGroup,
  };
}

export async function getGroupById(
  groupId: ObjectId | string,
): Promise<GroupDB | null> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");
  const groups = db.collection<GroupDB>("groups");

  const id = typeof groupId === "string" ? new ObjectId(groupId) : groupId;
  return groups.findOne({ _id: id });
}

export async function getUserGroups(
  userId: ObjectId | string,
): Promise<GroupDB[]> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");
  const groups = db.collection<GroupDB>("groups");

  const uid = typeof userId === "string" ? new ObjectId(userId) : userId;
  return groups.find({ memberIds: uid }).toArray();
}

export async function addGroupMember(
  groupId: ObjectId | string,
  userId: ObjectId | string,
): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");
  const groups = db.collection<GroupDB>("groups");

  const gid = typeof groupId === "string" ? new ObjectId(groupId) : groupId;
  const uid = typeof userId === "string" ? new ObjectId(userId) : userId;

  const result = await groups.findOneAndUpdate(
    { _id: gid },
    {
      $addToSet: { memberIds: uid },
      $set: { updatedAt: new Date() },
    },
    { returnDocument: "after" },
  );

  return !!result;
}

export async function removeGroupMember(
  groupId: ObjectId | string,
  userId: ObjectId | string,
): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");
  const groups = db.collection<GroupDB>("groups");

  const gid = typeof groupId === "string" ? new ObjectId(groupId) : groupId;
  const uid = typeof userId === "string" ? new ObjectId(userId) : userId;

  const result = await groups.findOneAndUpdate(
    { _id: gid, ownerId: uid },
    {
      $pull: { memberIds: uid },
      $set: { updatedAt: new Date() },
    },
    { returnDocument: "after" },
  );

  return !!result;
}

export async function deleteGroup(
  groupId: ObjectId | string,
  ownerId: ObjectId | string,
): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");
  const groups = db.collection<GroupDB>("groups");

  const gid = typeof groupId === "string" ? new ObjectId(groupId) : groupId;
  const oid = typeof ownerId === "string" ? new ObjectId(ownerId) : ownerId;

  const result = await groups.deleteOne({ _id: gid, ownerId: oid });
  return result.deletedCount > 0;
}

export async function getGroupMembers(
  groupId: ObjectId | string,
): Promise<ObjectId[]> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");
  const groups = db.collection<GroupDB>("groups");

  const gid = typeof groupId === "string" ? new ObjectId(groupId) : groupId;
  const group = await groups.findOne({ _id: gid });
  return group?.memberIds ?? [];
}
