enum ConversationSpeed {
  VERY_SLOW,
  SLOW,
  NORMAL,
  FAST,
  VERY_FAST
}

export function getMultiplierForConversationSpeed(speed:ConversationSpeed) {
  switch (speed) {
    case ConversationSpeed.VERY_SLOW:
      return 2;
    case ConversationSpeed.SLOW:
      return 1.5;
    case ConversationSpeed.NORMAL:
      return 1;
    case ConversationSpeed.FAST:
      return .5;
    case ConversationSpeed.VERY_FAST:
      return .25;
  }
}

export default ConversationSpeed;