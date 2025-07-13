
import { Post } from "./post.model";
import { UserInfo } from "src/app/infrastructure/auth/model/userInfo.model";

export interface TrendsData {
  totalPosts: number;
  postsLastMonth: number;
  top5PostsLast7Days: Post[];
  top10PostsEver: Post[];
  top10UsersByLikesGivenLast7Days: UserInfo[];
}