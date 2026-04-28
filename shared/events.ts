export enum Events {
  // USERS
  USER_LOGIN = "user:login",

  // POSTS
  POST_CREATE = "post:create",
  POST_CREATED = "post:created",

  // SEARCH
  SEARCH = "search",
  SEARCH_RESULTS = "search:results",

  // FEED
  FEED_SUBSCRIBE = "feed:subscribe",
  FEED_INIT = "feed:init",

  // MESSAGES
  MESSAGE_SEND = "message:send",
  MESSAGE_NEW = "message:new",

  // COMMENTS
  COMMENT_ADD = "comment:add",
  COMMENT_ADDED = "comment:added",
  COMMENT_REPLY = "comment:reply",
  COMMENT_REPLIED = "comment:replied"
}