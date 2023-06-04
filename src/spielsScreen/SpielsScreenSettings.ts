import ConversationSpeed from "../conversations/ConversationSpeed";

// For settings specific to the Spiels Screen, but not specific to a spiel or any other project-based data.
type SpielsScreenSettings = {
  conversationSpeed: ConversationSpeed;
  playFullScreen: boolean;
}

export default SpielsScreenSettings;