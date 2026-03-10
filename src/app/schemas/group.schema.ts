import { z } from "zod";
import { ObjectId } from "mongodb";

export const CreateGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
});

export type CreateGroup = z.infer<typeof CreateGroupSchema>;

export interface GroupDB {
  _id: ObjectId;
  name: string;
  description?: string;
  ownerId: ObjectId;
  memberIds: ObjectId[]; // includes owner
  createdAt: Date;
  updatedAt: Date;
}

export type GroupPlainObject = Omit<GroupDB, "_id"> & { _id: string };
