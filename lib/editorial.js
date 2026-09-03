export const EDITORIALS = [
  {
    slug: 'how-smartwatches-evolved',
    title: 'How Smartwatches Evolved: From Notifications to Health Computers',
    excerpt: 'A concise history of the smartwatch category, from early connected watches to today’s health, fitness and cellular platforms.',
    category: 'History',
    date: '2026-09-02',
    readTime: '6 min read',
    sections: [
      ['The first generation was about the phone', 'Early smartwatches were primarily second screens: notifications, basic controls, alarms and simple apps. Their value came from reducing the number of times you had to take your phone out of your pocket.'],
      ['Fitness changed the category', 'GPS, optical heart-rate sensing and increasingly capable motion sensors turned the watch into a standalone fitness tool. Battery life became a much more important part of the buying decision.'],
      ['Health became a core differentiator', 'ECG, blood-oxygen sensing, sleep tracking and safety features pushed smartwatches beyond convenience. The category increasingly became a continuous sensor platform worn throughout the day.'],
      ['Where the category is going', 'The next phase is less about adding another notification and more about making the accumulated sensor data useful: better recovery insights, more contextual coaching and tighter integration between hardware, software and health services.'],
    ],
  },
  {
    slug: 'smartwatch-battery-life-explained',
    title: 'Smartwatch Battery Life Explained: What the Number Really Means',
    excerpt: 'Why advertised battery life can be misleading, and which hardware choices actually determine how often you charge your watch.',
    category: 'Buying Guide',
    date: '2026-09-01',
    readTime: '5 min read',
    sections: [
      ['Battery claims are not directly comparable', 'A quoted battery figure depends on display settings, workout frequency, GPS use, cellular connectivity and notification load. Two watches with similar advertised numbers can behave very differently in daily use.'],
      ['The display is one of the biggest variables', 'Always-on displays, high refresh rates and bright outdoor settings increase power consumption. A simpler display can therefore deliver much longer endurance without a larger battery.'],
      ['GPS and cellular change the equation', 'Continuous GPS recording is demanding, while cellular radios can add another significant power cost. If you train for hours or use your watch away from your phone, advertised battery life deserves extra scrutiny.'],
      ['Think in charging cycles, not just hours', 'For sleep tracking, the useful question is whether the watch can comfortably survive a full day and night. A watch with slightly lower headline endurance can be better if it charges quickly during a short daily routine.'],
    ],
  },
  {
    slug: 'gps-vs-cellular-smartwatch',
    title: 'GPS vs Cellular on a Smartwatch: Do You Actually Need Both?',
    excerpt: 'GPS and cellular solve completely different problems. Here is when each one matters and when paying extra makes little sense.',
    category: 'Technology',
    date: '2026-08-29',
    readTime: '5 min read',
    sections: [
      ['GPS means location without your phone', 'Onboard GPS lets the watch record routes, distance and pace during outdoor activities. It is especially valuable for runners, cyclists and hikers who want reliable tracking without carrying a phone.'],
      ['Cellular means communication without your phone', 'Cellular connectivity is about network access: calls, messages, streaming and selected online functions while your phone is elsewhere. It normally requires a compatible carrier plan and adds both cost and power consumption.'],
      ['Most people do not need cellular', 'If your phone is normally nearby, Bluetooth and Wi-Fi cover most everyday smartwatch tasks. GPS, however, can still be useful even when cellular is unnecessary.'],
      ['Choose based on your routine', 'Prioritize GPS if outdoor training matters. Prioritize cellular if you regularly leave your phone behind and still need communication or connected services.'],
    ],
  },
  {
    slug: 'what-ecg-smartwatch-really-does',
    title: 'What an ECG Smartwatch Actually Does',
    excerpt: 'ECG is one of the most misunderstood smartwatch features. Here is what the sensor measures and what it does not.',
    category: 'Health',
    date: '2026-08-27',
    readTime: '6 min read',
    sections: [
      ['ECG is electrical, not optical', 'An ECG-capable watch uses electrodes to record electrical activity associated with the heartbeat. That is fundamentally different from optical heart-rate sensing, which estimates pulse using light.'],
      ['It can provide a useful snapshot', 'A compatible ECG feature can help identify certain rhythm patterns and produce a recording that may be useful to discuss with a qualified clinician. It is not the same as continuous clinical monitoring.'],
      ['Availability depends on more than hardware', 'A watch may contain the required electrodes while the feature remains limited by region, regulatory authorization, software version or phone compatibility.'],
      ['Treat it as a screening tool', 'Smartwatch health features can be useful for awareness and screening, but they should not be treated as a diagnosis or a replacement for professional medical evaluation.'],
    ],
  },
];

export function getEditorial(slug) {
  return EDITORIALS.find((article) => article.slug === slug) || null;
}
