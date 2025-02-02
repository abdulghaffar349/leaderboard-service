export const getLeaderboardKey = (uniqueSuffix) => {
	return `leaderboard:${uniqueSuffix}`; //leaderboard:[gameId]
}
export const getPopularGameIdentifierKey = (uniqueSuffix) => {
	return `is:popular:${uniqueSuffix}`; //is:popular:[gameId]
}
export const getCachedPopularGameKey = (uniqueSuffix) => {
	return `game:popular:limit:${uniqueSuffix}`; //e.g game:popular:limit:[gameId]:[limit]
}