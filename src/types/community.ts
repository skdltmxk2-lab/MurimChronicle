export type PostCategory = "question" | "info";

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  question: "질문",
  info: "정보공유",
};

export const CATEGORY_STYLE: Record<PostCategory, string> = {
  question: "bg-brand-50 text-brand-700",
  info: "bg-mint-50 text-mint-700",
};

export type CommunityPost = {
  id: string;
  user_id: string | null;
  user_name: string;
  title: string;
  content: string;
  category: PostCategory;
  like_count: number;
  comment_count: number;
  created_at: string;
  liked_by_me?: boolean;
};

export type CommunityComment = {
  id: string;
  post_id: string;
  user_id: string | null;
  user_name: string;
  content: string;
  created_at: string;
};
