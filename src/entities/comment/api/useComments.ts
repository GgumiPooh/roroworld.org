"use client";

import { assert, type Nullable } from "@/shared/lib";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { type Comment, type UseCommentsConfig } from "../model/types";

export function useComments(config: UseCommentsConfig) {
  const { autoFetch = true, currentUserDisplayName, deleteEndpoint, fetchEndpoint } = config;
  const queryClient = useQueryClient();
  const [localComments, setLocalComments] = useState<Comment[]>([]);

  const query = useQuery({
    enabled: autoFetch,
    queryFn: async (): Promise<Comment[]> => {
      const res = await fetch(fetchEndpoint, {
        credentials: "include",
      });
      assert(res.ok, "Failed to fetch comments");
      return res.json();
    },
    queryKey: ["comments", fetchEndpoint],
  });

  const queryData = query.data ?? [];
  const comments = [
    ...localComments,
    ...queryData.filter((c) => !localComments.some((local) => local.id === c.id)),
  ];

  const addComment = useCallback((newComment: Comment) => {
    setLocalComments((prev) => [newComment, ...prev]);
  }, []);

  const deleteComment = useCallback(
    async (commentId: number) => {
      if (!confirm("삭제하시겠습니까?")) {
        return false;
      }

      try {
        const res = await fetch(deleteEndpoint(commentId), {
          credentials: "include",
          method: "DELETE",
        });

        assert(res.ok, "Failed to delete");

        setLocalComments((prev) => prev.filter((comment) => comment.id !== commentId));
        await queryClient.invalidateQueries({ queryKey: ["comments", fetchEndpoint] });
        return true;
      } catch (err) {
        console.error("Failed to delete:", err);
        alert("삭제에 실패했습니다.");
        return false;
      }
    },
    [deleteEndpoint, fetchEndpoint, queryClient],
  );

  const isOwnComment = useCallback(
    (author: string) => Boolean(currentUserDisplayName && author === currentUserDisplayName),
    [currentUserDisplayName],
  );

  return {
    addComment,
    comments,
    deleteComment,
    error: (query.error ? "댓글을 불러오는데 실패했습니다." : null) as Nullable<string>,
    isLoading: query.isLoading,
    isOwnComment,
    refresh: () => query.refetch(),
  };
}
