// selectors.js
import { createSelector } from "reselect";

const selectMode = (state) => state.auth.mode;
const selectToken = (state) => state.auth.token;
const selectUser = (state) => state.auth.user;

const selectFriends = createSelector([selectUser], (user) =>
  user ? user.friends : []
);

export const selectAuthDetails = createSelector(
  [selectMode, selectToken, selectUser],
  (mode, token, user) => ({ mode, token, user })
);

export { selectFriends };
