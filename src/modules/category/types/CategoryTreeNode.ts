import { ObjectId } from "mongoose";

export interface CategoryTreeNode {
  _id: ObjectId;
  name: string;
  slug: string;
  description?: string;
  parentId?: ObjectId | null;
  level: number;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
  children: CategoryTreeNode[];
}
