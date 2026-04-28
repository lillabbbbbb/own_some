import {Post} from "../shared/types"

export default class FeedViewer {
  private posts: Post[] = [];
  private index = 0;

  constructor(initial: Post[]) {
    this.posts = initial;
  }

  add(post: Post) {
    this.posts.unshift(post); // newest first
    this.index = 0;
  }

  addComment(postId: number, comment: any) {
    const post = this.posts.find(p => Number(p.id) === Number(postId));
    if (post) {
      post.comments.push(comment);
    }
  }

  current() {
    return this.posts[this.index];
  }

  next() {
    if (this.index < this.posts.length - 1) this.index++;
  }

  prev() {
    if (this.index > 0) this.index--;
  }

  getIndex() {
    return this.index;
  }

  size() {
    return this.posts.length;
  }
}