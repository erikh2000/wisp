# Conversation State Machine

![](/Users/erikrhermansen/Documents/wisp/src/conversations/conversationState.png)

* STOPPED - mic off
  * User clicks "start".
  * If more lines, go to TALKING.
  * If no more lines, go to IDLE.
  
* TALKING - mic off, playing speech.
  * When speech ends, go to PAUSING AFTER LINE.
  
* PAUSING AFTER LINE - mic ON
  * If player speaks, go to LISTENING.
  * If pause ends...
    * If more lines, go to TALKING.
    * If no more lines, go to IDLE.
    
* LISTENING - mic ON, player speaking
  * When player stops speaking...
    * If matched reply, go to REPLYING.
    * If no match...
      * If more lines, go to TALKING.
      * If no more lines, go to IDLE.
      
* IDLE - mic ON
  * If player speaks, go to LISTENING.
  
* REPLYING - mic off, playing speech
  * When speech ends, go to PAUSING AFTER REPLY.
  
* PAUSING AFTER REPLY - mic off
  * When pause ends...
    * If more lines, go to TALKING.
    * If no more lines, go to IDLE.

