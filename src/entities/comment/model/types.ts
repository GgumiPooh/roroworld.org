import { type Nullable } from "@/shared/lib";

export type Comment = {
  author?: string;
  authorName?: string;
  content: string;
  createdAt: string;
  id: number;
};

export type UseCommentsConfig = {
  autoFetch?: boolean;
  currentUserDisplayName?: Nullable<string>;
  deleteEndpoint: (id: number) => string;
  fetchEndpoint: string;
};
