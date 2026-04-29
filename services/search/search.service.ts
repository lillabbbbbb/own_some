import { users } from "../user/user.service";
import { SearchResult } from "../../shared/types";


export function searchUsers(query: string): SearchResult[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return [];

  const results: SearchResult[] = [];

  for (const [username] of users.entries()) {
    if (username.toLowerCase().includes(normalized)) {
      results.push({ username });

      if (results.length >= 10) break; // limit results
    }
  }

  return results;
}