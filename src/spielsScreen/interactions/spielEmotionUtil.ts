import { Emotion } from 'sl-web-face';
import { Emotion as SpielEmotion } from 'sl-spiel';

export function emotionToSpielEmotion(emotion:Emotion):SpielEmotion {
  switch (emotion) {
    case Emotion.NEUTRAL: return SpielEmotion.NEUTRAL;
    case Emotion.AFRAID: return SpielEmotion.AFRAID;
    case Emotion.AMUSED: return SpielEmotion.AMUSED;
    case Emotion.ANGRY: return SpielEmotion.ANGRY;
    case Emotion.CONFUSED: return SpielEmotion.CONFUSED;
    case Emotion.EVIL: return SpielEmotion.EVIL;
    case Emotion.HAPPY: return SpielEmotion.HAPPY;
    case Emotion.IRRITATED: return SpielEmotion.IRRITATED;
    case Emotion.SAD: return SpielEmotion.SAD;
    case Emotion.SUSPICIOUS: return SpielEmotion.SUSPICIOUS;
    case Emotion.THINKING: return SpielEmotion.THINKING;
    default: return SpielEmotion.NEUTRAL;
  }
}

export function spielEmotionToEmotion(emotion:SpielEmotion):Emotion {
  switch (emotion) {
    case SpielEmotion.NEUTRAL: return Emotion.NEUTRAL;
    case SpielEmotion.AFRAID: return Emotion.AFRAID;
    case SpielEmotion.AMUSED: return Emotion.AMUSED;
    case SpielEmotion.ANGRY: return Emotion.ANGRY;
    case SpielEmotion.CONFUSED: return Emotion.CONFUSED;
    case SpielEmotion.EVIL: return Emotion.EVIL;
    case SpielEmotion.HAPPY: return Emotion.HAPPY;
    case SpielEmotion.IRRITATED: return Emotion.IRRITATED;
    case SpielEmotion.SAD: return Emotion.SAD;
    case SpielEmotion.SUSPICIOUS: return Emotion.SUSPICIOUS;
    case SpielEmotion.THINKING: return Emotion.THINKING;
    default: return Emotion.NEUTRAL;
  }
}

export function spielEmotionToParenthetical(emotion:SpielEmotion):string {
  switch (emotion) {
    case SpielEmotion.NEUTRAL: return '(neutral)';
    case SpielEmotion.AFRAID: return '(afraid)';
    case SpielEmotion.AMUSED: return '(amused)';
    case SpielEmotion.ANGRY: return '(angry)';
    case SpielEmotion.CONFUSED: return '(confused)';
    case SpielEmotion.EVIL: return '(evil)';
    case SpielEmotion.HAPPY: return '(happy)';
    case SpielEmotion.IRRITATED: return '(irritated)';
    case SpielEmotion.SAD: return '(sad)';
    case SpielEmotion.SUSPICIOUS: return '(suspicious)';
    case SpielEmotion.THINKING: return '(thinking)';
    default: return '(unknown)';
  }
}