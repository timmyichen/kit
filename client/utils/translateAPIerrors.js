function translateAPIerrors(msg) {
  switch(msg) {
    case 'no-access':
      return 'You do not have access to that action';
    case 'duplicate-request':
      return 'You are trying to send a duplicate request';
    case 'already-friends':
      return 'You are already friends';
    case 'no-request-found':
      return 'No request was found';
    case 'not-friends':
      return 'User is not a friend';
    case 'already-blocked':
      return 'User is already blocked';
    case 'not-blocked':
      return 'User is not blocked';
    case 'not-owner':
      return 'You are not the owner of that data';
    default:
      return 'Unknown error.';
  }
}

export default translateAPIerrors;