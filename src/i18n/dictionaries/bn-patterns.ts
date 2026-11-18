// Bangla for text that is generated at run time with numbers in it, for example
// "30 − 10 = 20 N is the force used in the formula." Numbers, units, operators
// and formulas are carried over exactly as they appear; only the words change.

type Translate = (s: string) => string;
export type Pattern = [RegExp, string | ((m: RegExpMatchArray, tr: Translate) => string)];

const STATUS = "(Mastered|Developing|Weak|Not assessed)";
const LEVEL = "(Easy|Medium|Advanced|Expert)";

export const BN_PATTERNS: Pattern[] = [
  // Numbers with a unit only: unchanged.
  [/^-?\d+(?:\.\d+)? ?(N|kg|m\/s²|m\/s)$/, (m) => m[0]],

  // Interface text built from values
  [/^Welcome, (.+)$/, (m) => `স্বাগতম, ${m[1]}`],
  [/^(.+) mode(?:\. Goal: (.+))?\.$/, (m, tr) => `${tr(m[1])} মোড${m[2] ? `। লক্ষ্য: ${tr(m[2])}` : ""}।`],
  [/^(\d+) recorded answers$/, (m) => `${m[1]}টি উত্তর রেকর্ড হয়েছে`],
  [/^(\d+) correct$/, (m) => `${m[1]}টি সঠিক`],
  [/^Get a hint \((\d+) of 3 used\)$/, (m) => `ইঙ্গিত নাও (${m[1]} / 3 ব্যবহৃত)`],
  [/^Topic, (.+)$/, (m, tr) => `বিষয়, ${tr(m[1])}`],
  [/^(\d+) prerequisites?$/, (m) => `${m[1]}টি পূর্বশর্ত`],
  [/^· was (.+)$/, (m, tr) => `· আগে ছিল ${tr(m[1])}`],
  [/^A (\S+) kilogram object on a rough floor, pushed to the right with (\S+) newtons\.$/, (m) => `অমসৃণ মেঝেতে ${m[1]} kg ভরের একটি বস্তু, যাকে ডান দিকে ${m[2]} N বলে ধাক্কা দেওয়া হচ্ছে।`],
  [/^The (\S+) kg object with a (\S+) newton push(?:, (\S+) newtons of friction)?(?:, and a (\S+) newton net force)?\.$/,
    (m) => `${m[1]} kg ভরের বস্তু, ${m[2]} N ধাক্কাসহ${m[3] ? `, ${m[3]} N ঘর্ষণ বল` : ""}${m[4] ? `, এবং ${m[4]} N লব্ধ বল` : ""}।`],

  // Activity log and timeline labels
  [/^Learning mode set to (.+)$/, (m, tr) => `শেখার মোড: ${tr(m[1])}`],
  [/^Readiness for Newton’s Second Law: (.+)$/, (m, tr) => `নিউটনের দ্বিতীয় সূত্রের জন্য প্রস্তুতি: ${tr(m[1])}`],
  [/^Diagnostic answer checked: (.+)$/, (m) => `ডায়াগনস্টিক উত্তর যাচাই হয়েছে: ${m[1]}`],
  [/^Suspected (.+), follow-up needed$/, (m, tr) => `সন্দেহজনক ${tr(m[1])}, অতিরিক্ত প্রশ্ন দরকার`],
  [/^Gap verified: (.+)$/, (m, tr) => `ঘাটতি নিশ্চিত: ${tr(m[1])}`],
  [/^Follow-up answered: (.+)$/, (m, tr) => `অতিরিক্ত প্রশ্নের উত্তর দেওয়া হয়েছে: ${tr(m[1])}`],
  [new RegExp(`^${LEVEL} practice question (solved|missed)$`), (m, tr) => `${tr(m[1])} অনুশীলনের প্রশ্ন ${m[2] === "solved" ? "সমাধান হয়েছে" : "ভুল হয়েছে"}`],
  [new RegExp(`^${LEVEL} practice solved$`), (m, tr) => `${tr(m[1])} অনুশীলন সমাধান`],
  [/^Readiness check (R\d+)$/, (m) => `প্রস্তুতি যাচাই ${m[1]}`],
  [/^Diagnostic (Q\d+)$/, (m) => `ডায়াগনস্টিক ${m[1]}`],
  [/^Practice (P\w+)$/, (m) => `অনুশীলন ${m[1]}`],
  [new RegExp(`^(.+) is now ${STATUS}$`), (m, tr) => `${tr(m[1])} এখন ${tr(m[2])}`],
  [new RegExp(`^(.+): ${STATUS}(, current target)?$`), (m, tr) => `${tr(m[1])}: ${tr(m[2])}${m[3] ? ", বর্তমান লক্ষ্য" : ""}`],

  // Physics checks
  [/^A force is divided by the (\S+) kg mass, so a = F ÷ m is being used\.$/, (m) => `একটি বলকে ${m[1]} kg ভর দিয়ে ভাগ করা হয়েছে, অর্থাৎ a = F ÷ m ব্যবহার হচ্ছে।`],
  [/^(\S+) − (\S+) = (\S+) N is the force used in the formula\.$/, (m) => `সূত্রে ব্যবহৃত বলটি হলো ${m[1]} − ${m[2]} = ${m[3]} N।`],
  [/^The net force (\S+) N was found, but the (\S+) N push was divided instead\.$/, (m) => `লব্ধ বল ${m[1]} N বের করা হয়েছে, কিন্তু ভাগ করা হয়েছে ${m[2]} N ধাক্কাকে।`],
  [/^The (\S+) N push was divided alone\.$/, (m) => `শুধু ${m[1]} N ধাক্কাকেই ভাগ করা হয়েছে।`],
  [/^The (\S+) N friction does not appear\.$/, (m) => `${m[1]} N ঘর্ষণ বল কোথাও নেই।`],
  [/^(\S+) N is not the net force on the block\.$/, (m) => `${m[1]} N ব্লকটির ওপর লব্ধ বল নয়।`],
  [/^(\S+) ([+−×÷]) (\S+) = (\S+), not (\S+)\.$/, (m) => `${m[1]} ${m[2]} ${m[3]} = ${m[4]}, ${m[5]} নয়।`],
  [/^(\S+) is the correct unit for acceleration\.$/, (m) => `${m[1]} হলো ত্বরণের সঠিক একক।`],
  [/^(\S+) is not a unit of acceleration\.$/, (m) => `${m[1]} ত্বরণের একক নয়।`],
  [/^Use (\S+)\.$/, (m) => `${m[1]} ব্যবহার করো।`],
  [/^(\S+) (m\/s²|m\/s|N|kg) is correct\.$/, (m) => `${m[1]} ${m[2]} সঠিক।`],
  [/^(.+) does not match the expected answer\.$/, (m) => `${m[1] === "No number" ? "কোনো সংখ্যা দেওয়া হয়নি, তাই উত্তরটি" : m[1]} প্রত্যাশিত উত্তরের সাথে মেলেনি।`],
  [/^Answered (\S+) (\S+); expected (\S+) (\S+)\.$/, (m) => `উত্তর: ${m[1] === "nothing" ? "কিছুই না" : m[1]} ${m[2]}; প্রত্যাশিত: ${m[3]} ${m[4]}।`],
  [/^Correct value with the unit (\S+)\.$/, (m) => `মান সঠিক, তবে একক দেওয়া হয়েছে ${m[1]}।`],

  // Hints and follow-up questions
  [/^First find F\(net\) = (\S+) − (\S+)\. Then divide that by (\S+) kg\.$/, (m) => `আগে F(net) = ${m[1]} − ${m[2]} বের করো। তারপর সেটিকে ${m[3]} kg দিয়ে ভাগ করো।`],
  [/^Which way does the (\S+) N of friction act on the moving object\?$/, (m) => `চলমান বস্তুটির ওপর ${m[1]} N ঘর্ষণ বল কোন দিকে কাজ করে?`],
  [/^The (\S+) N net force\. I divided the wrong number$/, (m) => `${m[1]} N লব্ধ বল। আমি ভুল সংখ্যাকে ভাগ করেছি`],
  [/^The (\S+) N net force$/, (m) => `${m[1]} N লব্ধ বল`],
  [/^The (\S+) N push and (\S+) N friction, but I didn’t subtract friction$/, (m) => `${m[1]} N ধাক্কা আর ${m[2]} N ঘর্ষণ, কিন্তু আমি ঘর্ষণ বিয়োগ করিনি`],
  [/^The (\S+) N push$/, (m) => `${m[1]} N ধাক্কা`],
  [/^Only the (\S+) N push$/, (m) => `শুধু ${m[1]} N ধাক্কা`],
  [/^I found the (\S+) N net force, then made a calculation mistake$/, (m) => `আমি ${m[1]} N লব্ধ বল বের করেছি, তারপর হিসাবে ভুল করেছি`],
  [/^Follow-up: “(.+)”\.$/, (m, tr) => `অতিরিক্ত প্রশ্নের উত্তর: “${tr(m[1])}”।`],

  // Socratic tutor
  [/^Let’s leave the formula aside for a moment\. Along the floor, which forces act on the (\S+) kg object\?$/, (m) => `চলো কিছুক্ষণের জন্য সূত্রটা সরিয়ে রাখি। মেঝে বরাবর ${m[1]} kg ভরের বস্তুটির ওপর কোন কোন বল কাজ করছে?`],
  [/^Just the (\S+) N push$/, (m) => `শুধু ${m[1]} N ধাক্কা`],
  [/^Yes\. Two forces act along the floor: the (\S+) N push and (\S+) N of friction\.$/, (m) => `হ্যাঁ। মেঝে বরাবর দুটি বল কাজ করছে: ${m[1]} N ধাক্কা আর ${m[2]} N ঘর্ষণ বল।`],
  [/^Read the problem again: (\S+) N of friction opposes the motion\.$/, (m) => `সমস্যাটি আবার পড়ো: ${m[1]} N ঘর্ষণ বল গতির বিপরীতে কাজ করছে।`],
  [/^The push is forward and friction is backward, so it is (\S+) − (\S+)\.$/, (m) => `ধাক্কা সামনের দিকে আর ঘর্ষণ পেছনের দিকে, তাই এটি ${m[1]} − ${m[2]}।`],
  [/^Use the (\S+) N you just worked out\.$/, (m) => `এইমাত্র বের করা ${m[1]} N ব্যবহার করো।`],
  [/^Then what is the acceleration of the (\S+) kg object\?$/, (m) => `তাহলে ${m[1]} kg ভরের বস্তুটির ত্বরণ কত?`],
  [/^(Concept|Formula|Step): (.+)$/, (m, tr) => `${tr(m[1])}: ${tr(m[2])}`],
  [/^(.+) Here is the law we are building towards:$/, (m, tr) => `${tr(m[1])} যে সূত্রের দিকে আমরা এগোচ্ছি, সেটি হলো:`],

  // Practice feedback
  [/^The number is right, but the unit should be (\S+)\.$/, (m) => `সংখ্যাটি সঠিক, কিন্তু একক হওয়া উচিত ${m[1]}।`],
];
